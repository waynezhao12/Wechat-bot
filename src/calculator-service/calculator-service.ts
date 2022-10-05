import { Message } from 'wechaty';


export class CalculatorService {
	convertSymbol(expression: string): string {
		let newExpression = expression.replaceAll('×', '*');
		newExpression = newExpression.replaceAll('÷', '/');
		newExpression = newExpression.replaceAll('（', '(');
		newExpression = newExpression.replaceAll('）', ')');

		return newExpression;
	}

	calculator(msg: Message) {
		let expression = this.convertSymbol(msg.text().slice(2));
		try {
			const result = eval(expression);
			msg.say(`${result}`);
		} catch (error) {
			msg.say('可莉不知道哦');
		}
	}
}
