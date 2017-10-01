const urls = require("url")
const iconv = require("iconv-lite")

module.exports = (uri, config = uri) => {
  const {
    url = uri,
    charset = "utf-8",
    method = "get",
  } = config
  const request = getRequest(url)
  const option = buildRequestOption(url)

  return new Promise((resolve, reject) => {
    request[method](option, res => {
      const body = []

      res.on("error", _ => reject({error: true}))
      res.on("data", chunk => body.push(chunk))

      res.on("end", _ => resolve(
        iconv.decode(Buffer.concat(body), charset)
      ))
    })
  })
}

function isHttps (url) {
  return url.startsWith("https:")
}

function getRequest (url) {
  return isHttps(url)
    ? require("https")
    : require("http")
}

function buildRequestOption (url) {
  return isHttps(url)
    ? buildAgentOption(url)
    : buildNormalOption(url)
}

function buildNormalOption (url) {
  return url
}

function buildAgentOption (url) {
  const {
    host,
    port = 443,
    path = "/"
  } = urls.parse(url)

  return {
    host,
    port,
    path,
    rejectUnauthorized: false
  }
}
