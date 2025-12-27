const CLIENT_ID = "YOUR_CLIENT_ID_HERE"
const API_KEY = "YOUR_API_KEY_HERE"

const SCOPES = "https://www.googleapis.com/auth/drive.file"

let tokenClient
let gapiInited = false
let gisInited = false

document.getElementById("loginBtn").onclick = handleAuthClick
document.getElementById("logoutBtn").onclick = handleSignout
document.getElementById("listBtn").onclick = listFiles
document.getElementById("uploadBtn").onclick = uploadFile
document.getElementById("createFolderBtn").onclick = createFolder

function gapiLoaded() {
  gapi.load("client", async () => {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
    })
    gapiInited = true
  })
}

function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: "",
  })
  gisInited = true
}

function handleAuthClick() {
  tokenClient.callback = (resp) => {
    if (resp.error) return
    document.getElementById("loginBtn").hidden = true
    document.getElementById("logoutBtn").hidden = false
    document.getElementById("actions").hidden = false
  }
  tokenClient.requestAccessToken({ prompt: "consent" })
}

function handleSignout() {
  const token = gapi.client.getToken()
  if (token) {
    google.accounts.oauth2.revoke(token.access_token)
    gapi.client.setToken("")
  }
  document.getElementById("loginBtn").hidden = false
  document.getElementById("logoutBtn").hidden = true
  document.getElementById("actions").hidden = true
  document.getElementById("fileList").innerHTML = ""
}

async function listFiles() {
  const res = await gapi.client.drive.files.list({
    pageSize: 10,
    fields: "files(id, name)",
  })

  const list = document.getElementById("fileList")
  list.innerHTML = ""

  res.result.files.forEach(file => {
    const li = document.createElement("li")
    li.textContent = file.name
    list.appendChild(li)
  })
}

async function uploadFile() {
  const file = document.getElementById("fileInput").files[0]
  if (!file) return alert("Select a file")

  const metadata = {
    name: file.name,
    mimeType: file.type,
  }

  const form = new FormData()
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }))
  form.append("file", file)

  await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: new Headers({
      Authorization: "Bearer " + gapi.client.getToken().access_token,
    }),
    body: form,
  })

  alert("File uploaded")
}

async function createFolder() {
  await gapi.client.drive.files.create({
    resource: {
      name: "My Yellow Folder",
      mimeType: "application/vnd.google-apps.folder",
    },
  })
  alert("Folder created")
}

window.onload = () => {
  gapiLoaded()
  gisLoaded()
}
