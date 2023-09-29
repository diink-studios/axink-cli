import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";
import { Confirm, Input, Checkbox } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts";
import { dirname } from "https://deno.land/std@0.203.0/path/mod.ts";
import * as path from "https://deno.land/std@0.188.0/path/mod.ts";
import { copySync }from "https://deno.land/std@0.203.0/fs/copy.ts";
import { readDirSync } from "https://deno.land/std@0.203.0/fs/mod.ts";
import { colors, tty } from "https://deno.land/x/cliffy@v1.0.0-rc.3/ansi/mod.ts";
import { delay } from "https://deno.land/std@0.196.0/async/delay.ts";

import { generateEntity, generateScript, parseName } from './generate.ts'

const error = colors.bold.red;
const success = colors.bold.green;
const warn = colors.bold.yellow;
const info = colors.bold.blue;



const create = new Command()
  .description("Clone a repository into a newly created directory.")
  .action(async () => {
    const __dirname = path.resolve();
    const projectName = await Input.prompt({
      message: "Enter the project name",
      default:  "axink-project",
    });
  
    const template = await Input.prompt({
      message: "Select template",
      list: true,
      suggestions: [
        "default",
        "space shooter",
        "pong",
      ],
      default: 'default',
    });


    let cmd = new Deno.Command("git", { args: ["clone",  "https://github.com/diink-studios/axink-templates"] });
    let { code, stdout, stderr } = await cmd.output();

    await copySync(`./axink-templates/${template || 'default'}`, `./${projectName}`);
    await Deno.remove("./axink-templates", { recursive: true });

    console.log(success("Let's start your game!"));
    console.log(warn(`cd ./${projectName}`));
    console.log(warn(`deno task dev`));
    
  });


const generate = new Command()
  .arguments("<type:string>")
  .description("Generate Entity or Script.")
  .action(async (arg: any, type: string) => {

    try {
      Deno.openSync("axink.json", { read: true });
    } catch (e) {
      console.log(error(`Run the command in the root of the project`));
      return;
    }

    const fileName = await Input.prompt({
      message: "Enter the file name",
      default:  `${type}-default`,
    });
  

    
    if (type === 'entity') {

      
    const components = await Checkbox.prompt({
      message: "Do you want to add components",
      options: ['Camera', 'Script', 'Mesh', 'Sprite', 'Light', 'BoxCollider']
    });

      Deno.writeTextFileSync(path.resolve('./src','./entities', `${fileName}.ts`), generateEntity(fileName, ['Transform', ...components]));

      // const decoder = new TextDecoder("utf-8");
      let text = Deno.readTextFileSync(path.resolve('./src','./entities', `./entities.ts`));
      // const text = decoder.decode(data);

      // const file = await Deno.open(path.resolve('./src','./entities', `./entities.ts`), { append: true});

      text = text.replace('// DYNAMIC IMPORT', `import { ${parseName(fileName)} } from './${fileName}.ts';
// DYNAMIC IMPORT`);

      text = text.replace(']);', `  ['${parseName(fileName)}', ${parseName(fileName)}],
]);`);

    console.log(text)

      Deno.writeTextFileSync(path.resolve('./src','./entities', `./entities.ts`), text);
    }

    if (type === 'script') {
      await Deno.writeTextFile(path.resolve('./src','./scripts', `${fileName}.ts`), generateScript(fileName));
    }

    console.log("Generate command called");
  });

await new Command()
  .name("Axink CLI")
  .version("0.1.0-alhpa")
  .description("Command line framework for Axink")
  .command('create', create)
  .command('generate', generate)
  .parse(Deno.args);

  