import helpOtherCommands from "./helpOtherCommands";
import help from "./help";

// ヘルプコマンドを含むすべてのコマンド
export default new Map([...helpOtherCommands.entries(), ["help", help]]);