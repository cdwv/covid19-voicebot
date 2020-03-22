const AGIServer = require('ding-dong');
const path = require('path');
const getQuestions = require('./get_question');
const parseAnswers = require('./answers');
const getRecording = require('./recording');
const sessions = {}

const processAnswers = (questions, answers) => {

}

async function main(param1) {
	let questions = (await getQuestions())
		.map(q => ({
			...q, 
			answers: parseAnswers(
				q.answers, 
				q.nextQuestions ? q.nextQuestions.map(nq => nq.dataUrl): q.nextQuestions
			)
		}));
	const handler = context => {
		context.onEvent('variables')
			.then(async () => {
				const transcription_text = context.variables.agi_arg_1;
				const transcription_confidence = Number(context.variables.agi_arg_2);

				if (sessions[context.variables.agi_uniqueid] === undefined) {
					sessions[context.variables.agi_uniqueid] = {};
				}

				const session = sessions[context.variables.agi_uniqueid];
				
				let questionText;
				if (session.question === undefined) {
					session.question = questions.filter(q => q.type == 'start').pop();
					questionText = session.question.text;
				} else if (session.question) {
					// console.log('vars', context.variables)
					console.log('last question', session.question)
					console.log({transcription_confidence, transcription_text})
					const matchingAnswers = session.question.answers.filter(a => a.match(transcription_text));
					console.log(matchingAnswers)
					if(matchingAnswers.length > 0) {

					// }
					// if(session.question.answers.map(a => a.toLowerCase()).includes(transcription_text)) {
						let nextQuestionId = matchingAnswers.pop().nextQuestion.split('/').pop();
						console.log(nextQuestionId)
						session.question = questions.filter(q => (q.id === nextQuestionId)).pop();
						console.log(session.question)
						questionText = session.question.text;
						if (session.question.type === 'end') {
							session.finished = 1
						}
					} else {
						let answers = session.question.answers.filter(a => !a.hidden).map(a => a.text);
						let answerText;
						
						if(answers.length === 1) {
							answerText = 'Powiedz. ' + answers[0] + '. Żeby kontynuować.'
						} else {
							let lastAnswer = answers.pop();
							answerText = "Dostępne odpowiedzi to. " + answers.join('. ') + '. lub ' + lastAnswer;
						}

						if (session.question.description) {
							questionText = session.question.description + '.' + answerText
						} else {
							questionText = "Nie rozumiem. " + answerText;
						}
					}
				}

				let recordingFilename = await getRecording(questionText, { path: '/app/audio_snippets', languageCode: 'pl-PL' })
				recordingFilename = path.basename(recordingFilename);
				recordingFilename = path.join('audio_snippets', recordingFilename.replace(/\.\w+$/, ''));
				console.log('stream file', recordingFilename)
				return context.streamFile(recordingFilename);
			})
			.then(() => {
				const session = sessions[context.variables.agi_uniqueid];
				return context.setVariable('FINISHED', Number(!!session.finished));
			})
			.then(() => context.end());
	}
	const agi = new AGIServer(handler);
	agi.start(3000);

}

main(...process.argv.slice(2,));