
const express = require('express')
const app = express()
var fetch = require('node-fetch');
require('dotenv').config()
const {DOC_URL, DOC_CSV_URL} = process.env;


const port = 3000

const get_data = async() =>{
    const res = await fetch(DOC_CSV_URL)
    const body = await res.text();
    return body;
}

const getIndexForLanguage = async (langCode) => {
    const csv = await get_data().catch(e => console.log(e));    
    const lines = csv.split("\n")
    const keyArray = lines[0].replace("\r", "").split('\t')
    return keyArray.indexOf(langCode)
}


const renderLang = async (data, lang) => {
    const trKey = await getIndexForLanguage(lang);
    let translation={};
    data.forEach(fields => {
        translation[`${fields[0]}.${fields[1]}`] = fields[trKey]
    })
    return translation;
}


const formatData = (csv)=>{
    const lines = csv.split("\n")
    const keys = lines[0];
    const tLines = lines.slice(1).map(i => i.replace("\r", ""))   
    return tLines.map(i => i.split('\t'))
}

const getLangStrings = async ()=>{
    const csv = await get_data().catch(e => console.log(e));    
    return formatData(csv)
}

const getStringsForLan = async lang =>{
    const langStrings = await getLangStrings();
    return renderLang(langStrings, lang)
}

app.get('/', (req, res) => {
    const API_BASE_URL = req.headers.host;    
    res.json({
        message: 'This API provides a json-interface for accessing tabular data from a Google Spreadsheet. Each language available is declare under the prop [languages] ',
        languages:{
            en: 'http://' + API_BASE_URL + '/en',
            sv: 'http://' + API_BASE_URL + '/sv',
            fi: 'http://' + API_BASE_URL + '/fi'
        },
        editSheetUrl: DOC_URL
    })
})

app.get('/en', async(req, res) => {
    const response = await getStringsForLan('en')
    res.json(response)
})
app.get('/sv', async(req, res) => {
    const response = await getStringsForLan('sv')
    res.json(response)
})

app.get('/fi', async(req, res) => {
    const response = await getStringsForLan('fi')
    res.json(response)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})