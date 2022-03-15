import fetch from 'cross-fetch';

let query1 = `{
  users(where:{id:"0xf8d5a45c4b5fe0e56e51e00f84b29ab9b9fd9f8b"}){
    id
    _balance
  }
}`;
let query2 = `{
  users(orderBy:_balance, first:100, orderDirection: desc){
    id
    _balance
  }
}`;
let query3 = `{
  users(orderBy:_balance, first:100){
    id
    _balance
  }
}`;
let query4 = `{
  transferEntities(first:1000, orderBy: timestamp, orderDirection:desc){
    _amount
    timestamp
  }
}`;
async function getTransfers() {
  let response = await fetch(
    'https://api.thegraph.com/subgraphs/name/nabeelimran/task1',
    {
      method: 'POST',
      body: JSON.stringify({ query1 }),
    },
  );
  let data = await response.json();
  let events = data.data.transferEntities;
  console.log(' =>', events);
}
getTransfers();