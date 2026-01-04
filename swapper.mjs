import http2 from 'http2';
// @feelikethat hairo is always best
const swapperpassword = ""; // swap pw
const swappertoken = ""; // swap token
const serverid = ""; //claimlenecek server id
const vanityurl = "yer6"; // silinip yeni swye alınacak url 

let mfaToken1;

const cH = {
  "User-Agent": "Mozilla/5.0",
  Authorization: swappertoken,
  "Content-Type": "application/json",
  Host: "canary.discord.com",
  "X-Super-Properties": "eyJicm93c2VyIjoiQ2hyb21lIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiQ2hyb21lIiwiY2xpZW50X2J1aWxkX251bWJlciI6MzU1NjI0fQ==",
  Cookie: "__dcfduid=e4b41870c0ea11ef8a7146a8012bdadc; __sdcfduid=e4b41870c0ea11ef8a7146a8012bdadc03493787d783a0a0e2f5bb4db161f4576d6b6e54f9daa8327c5fd3f8134d09c4; __cfruid=4389eaa152d58b286c2a2fbc722d11935cc63ac2-1739269782; _cfuvid=1Hc58Q1Yo6cXIWud4hS1_R5QFZMAJiiOVrOJIbWWkjI-1739269782714-0.0.1.1-604800000; cf_clearance=BdF_ewiRLaPoYyreIprXJkSVWfXVCQMQ1h7MIt1mY_o-1739277321-1.2.1.1-JmKhJ2BweCe_XyyQVVm5dNUm.fDE6NVE27a_qVOMTDXYsq_5dEoSObcNJfqQs2Lw5UC8mmAQ72IvYgqx3EjfL2inLPj7SqQJEfY6Cd2RT1FbZDqW.XVk60yGUBLqH8eoH9cp_UP_D.df5583FWOR3NKcdVtXVqd3SEntmDoIe1WVDVkf9f4U_LRIioqUfA3zqrWFSDYK7ZQb0eoG_PBi7Ps_cxnparGFk3Q.xOF4xhNXLOuYOt6piurTczIxdITUy5tUHvLlW5S4in5fzEqQ762fw8I2PhChSov7LV1x0Og"
};

const http2Request = (method, path, customHeaders = {}, body = null) => {
    return new Promise((resolve, reject) => {
        const req = http2.connect("https://canary.discord.com").request({ ":method": method, ":path": path, ...customHeaders });
        let data = "";
        req.on("response", () => req.on("data", chunk => data += chunk).on("end", () => resolve(data)));
        req.on("error", reject);
        if (body) req.write(body);
        req.end();
    });
};

async function handler() {
    const { mfa } = JSON.parse(await http2Request("PATCH", "/api/guilds/0/vanity-url", cH));
    if (!mfa?.ticket) return;
    const { token } = JSON.parse(await http2Request("POST", "/api/mfa/finish", cH, JSON.stringify({ ticket: mfa.ticket, mfa_type: "password", data: swapperpassword })));
    if (!token) return;
    mfaToken1 = token;
    console.log(`${mfaToken1.slice(0, 5)}...${mfaToken1.slice(-5)}`);
	deleteInvite();
	patchVanityUrl();
}

async function deleteInvite() {
    const deleteResponse = await http2Request("DELETE", `/api/invite/${vanityurl}`, { ...cH, "X-Discord-MFA-Authorization": mfaToken1 });
    console.log("[!] Deleted");
}

async function patchVanityUrl() {
    const patchResponse = await http2Request("PATCH", `/api/guilds/${serverid}/vanity-url`, { ...cH, "X-Discord-MFA-Authorization": mfaToken1 }, JSON.stringify({ code: vanityurl }));
    console.error("[!] Vanity URL changed:", JSON.parse(patchResponse));
}

handler();
