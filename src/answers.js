const badChars = /[\,\!\@\#\$\%\^\&\*\(\)\[\]\.\?\;\'\:\"\{\}\_]/g;

function matchAnswer(arg) {
    return arg.toLocaleLowerCase().replace(badChars, '').trim() == this.text;
}

function parseAnswers(answers, questions) {
    return answers.split("\n").reduce((p, c, i) => {
        return [...p, ...c.split('|').map(a => ({
            text: a.toLocaleLowerCase().replace(badChars, '').trim(),
            hidden: a[0] == '(' && a[a.length - 1] == ')',
            nextQuestion: questions ? questions[i] : undefined,
            match: matchAnswer
        }))]
    }, []);
}

module.exports = parseAnswers;
