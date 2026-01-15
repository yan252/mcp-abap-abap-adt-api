import { config } from 'dotenv';
import { ADTClient, session_types } from "abap-adt-api";
import path from 'path';


// 加载环境变量 - 确保在所有其他导入之前
const envPath = path.resolve(__dirname, '../.env');
// console.log('Loading environment variables from:', envPath);
const envResult = config({ path: envPath });


class AbapAdtServerTST {
  private adtClient: ADTClient;
    constructor() {
    
    const missingVars = ['SAP_URL', 'SAP_USER', 'SAP_PASSWORD'].filter(v => !process.env[v]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
    
    console.log('Creating ADTClient with parameters:');
    console.log('- URL:', process.env.SAP_URL);
    console.log('- User:', process.env.SAP_USER);
    console.log('- Client:', process.env.SAP_CLIENT);
    console.log('- Language:', process.env.SAP_LANGUAGE);
    
    this.adtClient = new ADTClient(
      process.env.SAP_URL as string,
      process.env.SAP_USER as string,
      process.env.SAP_PASSWORD as string,
      process.env.SAP_CLIENT as string,
      process.env.SAP_LANGUAGE as string
    );
    
    // console.log('ADTClient created successfully');
    this.adtClient.stateful = session_types.stateful
   
     
  }

  testLogin() {
    return this.adtClient.login();
  }
  searchObject(objName: string,objType: string){
    return this.adtClient.searchObject(objName,objType);
  }
  findObjectPath(objectUrl: string){
    return this.adtClient.findObjectPath(objectUrl);
  }
  testGetSource(objectUrl: string) {
    return this.adtClient.getObjectSource(objectUrl);
  }
}


const server = new AbapAdtServerTST();
server.searchObject("YZZH","PROG").then((res) => {
  console.log(res)
})
.catch((err) => {
  console.error('Search failed:', err);
})
// console.log(server.searchObject("YZZH","PROG"))
// server.testLogin()
//   .then(() => console.log('Login successful'))
//   .catch(err => console.error('Login failed:', err));

// const head = "GET /sap/bc/adt/compatibility/graph?sap-client=150&sap-language=ZH HTTP/1.1\r\nAccept: */*\r\nCache-Control: no-cache\r\nx-csrf-token: fetch\r\nX-sap-adt-sessiontype: stateful\r\nCookie: \r\nUser-Agent: axios/1.13.2\r\nAccept-Encoding: gzip, compress, deflate, br\r\nHost: 172.18.209.52:8000\r\nAuthorization: Basic R1dERVYxMDoxMjM0NTY=\r\nConnection: keep-alive\r\n\r\n"
// console.info(head)

  
  
