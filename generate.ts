export function parseName(name: string) {
  let tempName = name;

  if (name.includes('-')) {
    const tempSlipt = name.split('-');
    tempName = tempSlipt.map(item => item.charAt(0).toUpperCase() + item.slice(1)).join('');
  } else if (name.includes('_')) {
    const tempSlipt = name.split('_');
    tempName = tempSlipt.map(item =>  item.charAt(0).toUpperCase() + item.slice(1)).join('');
  } else {
    tempName = name.charAt(0).toUpperCase() + name.slice(1)
  }

  return tempName;
}

export function generateEntity(name: string, components: Array<string>) {
  // const comps = components.map(comp =>  `import`)

  let data = `import { Entity, ${components.join(', ')} } from 'axink';

export const ${parseName(name)} = new Entity('${parseName(name)}')
`;

  for (const comp of components) {
    data += `  .addComponent(new ${comp}())
`
  }

  return data;
}

export function generateScript(name: string) {
  return `import { AbstractScript } from 'axink';

export class ${parseName(name)} extends AbstractScript {

  start(): void {

  }

  update(): void {

  }
}`;
}