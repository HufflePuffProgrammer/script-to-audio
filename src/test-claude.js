// test-claude.js
const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

 async function test() {
  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 10,
    messages: [{ role: "user", content: "Say hi" }]
  });

  console.log(res.content[0].text);
}

// async function test() {
//   const res = await anthropic.messages.create({
//     model: "claude-3-5-haiku-20241022",
//     max_tokens: 10,
//     messages: [{ role: "user", content: "Say hi" }]
//   });

//   console.log(res.content[0].text);
// }

test();
//"claude-haiku-4-5"
// if it fails use claude-3-haiku-20240307