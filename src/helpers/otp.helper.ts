//import axios from 'axios'

//const resp = await axios({
  //method: 'GET', 
  //url,
  //headers: {
    //'User-Agent': 'PostmanRuntime/7.39.0',
    //'Accept': '*/*',
    //'Accept-Encoding': 'chunked, deflate, br',
    
  //},
  //maxRedirects: 0,
  //validateStatus: () => true,
//})

//console.log(resp.status)
//console.log(resp.headers['content-type'])
//console.log(String(resp.data).slice(0, 200))



//export class OtpHelper {
  //static async getOtp(
    //url: string,
    //timeoutMs = 60000,
    //intervalMs = 2000
  //): Promise<string> {
    //const deadline = Date.now() + timeoutMs
    //let lastStatus: number | undefined
    //let lastBody: any

    //while (Date.now() < deadline) {
      //const res = await axios.get(url, {
        //timeout: 15000,
        //validateStatus: () => true,
        //headers: {
          //'cache-control': 'no-cache',
          //pragma: 'no-cache',
        //},
      //})

      //lastStatus = res.status
      //lastBody = res.data

      //const text =
        //typeof res.data === 'string'
          //? res.data
          //: JSON.stringify(res.data)

      //  token:123456
      //const match = text.match(/token\s*:\s*(\d{6})/i)

      //if (match) {
        //return match[1]
      //}

      //await browser.pause(intervalMs)
    //}

    //const preview =
      //typeof lastBody === 'string'
        //? lastBody
        //: JSON.stringify(lastBody ?? '')

    //throw new Error(
     // `OTP token not received in ${timeoutMs}ms
//URL: ${url}
//Last status: ${lastStatus}
//Last body: ${preview.slice(0, 400)}`
  //  )
 // }
//}
