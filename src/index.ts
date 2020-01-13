interface UserInfo {
  atcoderId: string,
  name: string,
  submissions: AcSubmission[]
}

interface AcSubmission {
  id: number
  problem_id: string,
  contest_id: string,
  title: string
}

interface Submission {
  id: number,
  epoch_second: number,
  problem_id: string,
  contest_id: string,
  user_id: string,
  language: string,
  point: number,
  length: number,
  result: string,
  execution_time: number
}

interface Problem {
  id: string,
  contest_id: string,
  title: string
}

function main(): void {
  const targetDate = getTargetDate();
  const atcoderProblems = getAtcoderProblems();

  const sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('管理表');
  const data = sheet.getSheetValues(2, 1, sheet.getLastRow() - 1, 2);

  const result: UserInfo[] = [];
  data.forEach(row => {
    const atcoderId: string = row[0].trim();
    const name: string = row[1].trim();

    if (atcoderId === '') return;

    const url = `https://kenkoooo.com/atcoder/atcoder-api/results?user=${atcoderId}`;
    const response = UrlFetchApp.fetch(url, {
      method: 'get',
      contentType: 'application/json',
      muteHttpExceptions: true
    });

    if (response.getResponseCode() !== 200) return;

    let acSubmissions: AcSubmission[] = [];
    JSON.parse(response.getContentText()).forEach((submission: Submission) => {
      const submissionDate = getFormattedDate(new Date(submission.epoch_second * 1000));

      if ((submissionDate !== targetDate) || (submission.result !== 'AC')) return;

      // 同じ問題の提出なら最新のやつを選ぶ
      let updated = false;
      acSubmissions = acSubmissions.map(acSubmission => {
        if (acSubmission.problem_id === submission.problem_id
          && acSubmission.contest_id === submission.contest_id
          && acSubmission.id < submission.id
        ) {
          acSubmission.id = submission.id;
          updated = true;
        }

        return acSubmission;
      });

      if (!updated) {
        const problem = atcoderProblems.filter((problem: Problem) => {
          return problem.id === submission.problem_id && problem.contest_id === submission.contest_id;
        })[0];

        acSubmissions.push({
          id: submission.id,
          problem_id: submission.problem_id,
          contest_id: submission.contest_id,
          title: problem.title
        });
      }
    });

    acSubmissions.sort((a, b) => {
      if (a.title < b.title) return -1;
      if (a.title > b.title) return 1;
      return 0;
    });

    result.push({
      atcoderId: atcoderId,
      name: name,
      submissions: acSubmissions
    })

    Utilities.sleep(500);
  });

  if (result.length) {
    postMessage(`こんにちは！ *${targetDate}* にACした人を紹介するよ！`);

    result.forEach((userInfo: UserInfo) => {
      const messages = [];
      messages.push(`*${userInfo.atcoderId}*`);
      messages.push(...(userInfo.submissions.map(submission => {
        return `- <https://atcoder.jp/contests/${submission.contest_id}/tasks/${submission.problem_id}|${submission.title}> | <https://atcoder.jp/contests/${submission.contest_id}/submissions/${submission.id}|提出コード>`
      })));

      postMessage(messages.join('\n'));
    });

    postMessage('やってる！最高！褒めちゃう！');

    result.forEach((userInfo: UserInfo) => {
      if (userInfo.name === '') return;

      const message = `${userInfo.name}++`;
      postMessage(message);
    });
  }
}

function hello(): void {
  postMessage('こんにちは！僕の名前はAC褒め太郎。競プロを楽しんでる人を応援するよ！');
}

function postMessage(message: string): void {
  const webhookUrl = PropertiesService.getScriptProperties().getProperty('WEBHOOK_URL');
  UrlFetchApp.fetch(webhookUrl, {
    method: 'post',
    muteHttpExceptions: true,
    payload: JSON.stringify({
      username: 'AC褒め太郎',
      icon_emoji: ':star-struck:',
      text: message
    })
  });

  Utilities.sleep(500);
}

function getAtcoderProblems(): Problem[] {
  const url = 'https://kenkoooo.com/atcoder/resources/problems.json';
  const response = UrlFetchApp.fetch(url, {
    method: 'get',
    contentType: 'application/json',
    muteHttpExceptions: true
  });

  return JSON.parse(response.getContentText());
}

/**
 * 前日の日付を取得
 */
function getTargetDate(): string {
  const today = new Date();

  return getFormattedDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1));
}

function getFormattedDate(date: Date): string {
  return Utilities.formatDate(date, 'JST', 'yyyy-MM-dd');
}

function p(v: any): void {
  Logger.log(v);
}
