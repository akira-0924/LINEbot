 var TOKEN = 'zaTCNC/fT/GI3sh5yPzl+rpyhAPrhIuE3/4Y2pVtWyEGXN0T3Pe4LQWB2Sj7i/A7BKWHGFVJF1q/yWoaGgA/VPIEgu6fw/2uenUm6OmiNY7FQeVlPSRVUi4ijESVe6GepOY1n4SaI2YHFzbEXa1MOQdB04t89/1O/w1cDnyilFU=';

function doPost(e) {
  var event = JSON.parse(e.postData.contents).events[0];
  var replyToken= event.replyToken;

  if (typeof replyToken === 'undefined') {
    return;
  }

  var userId = event.source.userId;
  var username = getUserName(userId);

  if(event.type == 'message') {
    var userMessage = event.message.text;
    var replyMessage = getChaplusMessage(userMessage, username);
    appendRow(userMessage);
    sendMessage(replyToken, replyMessage);
    return ContentService.createTextOutput(
      JSON.stringify({'content': 'ok'})
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function sendMessage(replyToken, replyMessage) {
  var url = 'https://api.line.me/v2/bot/message/reply';
  UrlFetchApp.fetch(url, {
     'headers': {
       'Content-Type': 'application/json; charset=UTF-8',
       'Authorization': 'Bearer ' + TOKEN,
     },
     'method': 'post',
     'payload': JSON.stringify({
       'replyToken': replyToken,
       'messages': [{
         'type': 'text',
         'text': replyMessage,
       }],
     }),
   });
}

function getUserName(userId){ 
  var url = 'https://api.line.me/v2/bot/profile/' + userId;
  var userProfile = UrlFetchApp.fetch(url,{
    'headers': {
      'Authorization' :  'Bearer ' + TOKEN,
    },
  })
  return JSON.parse(userProfile).displayName;
}


function getChaplusMessage(mes, username) {
  var utterancePairs = [
    {
      "utterance":"おはよう！",
      "response":"やっほー！",
      "utterance":"じゃあね",
      "response":"バイバーイ",
      "utterance": "おやすみ",
      "response" : "おやすみなさ〜い"
    }
  ];
  var dialogue_options = {
    'utterance': mes,
    'username' : username,
    'agentState' : {
      'agentName' : '水島アキラbot', //LINE Botのチャネル名
      'age' : '21歳',
      'tone' : 'normal'
    }
  }
  var options = {
    'method': 'POST',
    'contentType': 'text/json',
    'payload': JSON.stringify(dialogue_options)
  };

  var chaplusUrl = "https://www.chaplus.jp/v1/chat?apikey=5fe726261c210";
  var response = UrlFetchApp.fetch(chaplusUrl, options);
  var content = JSON.parse(response.getContentText());

  var answer = content.bestResponse.utterance;
  return answer;
}

function appendRow(text) {
  var spreadsheet = SpreadsheetApp.openById("1UySFEfKojc-EHF7_IZ0bR_nYvl6x5Mkhsivt-6ICq8Q");
  var sheet = spreadsheet.getSheetByName("趣味");
  sheet.appendRow([new Date(),text]);
  return text;  
}
