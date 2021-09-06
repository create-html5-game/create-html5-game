import chalk from 'chalk';
import { spawn } from 'child_process';
import { program } from 'commander';
import fs from 'fs-extra';
import moment from 'moment';
import path from 'path';

function executeCommandAsync(
  command: string,
  params: string[],
  cwd: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const cmd = spawn(command, params, {
      cwd,
    });
    cmd.on('error', (error) => {
      reject(error);
    });
    cmd.on('close', () => {
      resolve();
    });
  });
}

async function createReactAppAsync(projectName: string): Promise<void> {
  console.log(chalk.blue('Running create-react-app...'));
  await executeCommandAsync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['create-react-app', projectName, '--template', 'typescript'],
    process.cwd()
  );
}

async function copyTemplateFilesAsync(
  projectName: string,
  options: Record<string, unknown>
): Promise<void> {
  console.log(chalk.blue('Copying template files...'));

  const projectDir = path.join(process.cwd(), projectName);
  const templateDir = path.join(__dirname, '..', 'template');

  await fs.remove(path.join(projectDir, 'public'));
  await fs.remove(path.join(projectDir, 'src'));
  await fs.copy(templateDir, projectDir);

  const publicFiles = await fs.readdir(path.join(projectDir, 'public'));
  publicFiles.forEach((file) => {
    const fullFilePath = path.join(projectDir, 'public', file);
    const fileContent = fs.readFileSync(fullFilePath).toString('utf-8');
    const newContent = fileContent
      .replace(/{project-name}/g, projectName)
      .replace(/{project-owner-company}/g, options.ownerCompany as string)
      .replace(/{project-owner-email}/g, options.ownerEmail as string)
      .replace(/{project-display-name}/g, options.displayName as string)
      .replace(/{project-creation-date}/g, moment().format('YYYY-MM-DD'));
    fs.writeFileSync(fullFilePath, newContent);
  });
}

async function installDepsAsync(projectName: string): Promise<void> {
  console.log(chalk.blue('Installing dependencies...'));

  const devDependencies = [
    '@trivago/prettier-plugin-sort-imports',
    '@typescript-eslint/eslint-plugin',
    'eslint-config-react-app',
    'eslint-config-prettier',
    'eslint-plugin-prettier',
    'prettier',
    'shx',
    'cross-env',
  ];
  for (const dep of devDependencies) {
    await executeCommandAsync(
      process.platform === 'win32' ? 'yarn.cmd' : 'yarn',
      ['add', dep, '-D'],
      path.join(process.cwd(), projectName)
    );
  }

  const dependencies = ['phaser'];
  for (const dep of dependencies) {
    await executeCommandAsync(
      process.platform === 'win32' ? 'yarn.cmd' : 'yarn',
      ['add', dep],
      path.join(process.cwd(), projectName)
    );
  }
}

async function overridePackageJsonAsync(projectName: string): Promise<void> {
  console.log(chalk.blue('Updating package.json...'));

  const content = await fs.readFile(
    path.join(process.cwd(), projectName, 'package.json')
  );
  const overrideContent = await fs.readFile(
    path.join(process.cwd(), projectName, 'package.override.json')
  );

  const json = JSON.parse(content.toString('utf-8'));
  const overrideJson = JSON.parse(overrideContent.toString('utf-8'));

  const newJson = {
    ...json,
    ...overrideJson,
  };
  await fs.writeFile(
    path.join(process.cwd(), projectName, 'package.json'),
    JSON.stringify(newJson, null, 2)
  );

  await fs.rm(path.join(process.cwd(), projectName, 'package.override.json'));
}

async function actionAsync(
  projectName: string,
  options: Record<string, unknown>
): Promise<void> {
  await createReactAppAsync(projectName);
  await copyTemplateFilesAsync(projectName, options);
  await installDepsAsync(projectName);
  await overridePackageJsonAsync(projectName);
}

export default async function runAsync() {
  program
    .arguments('<project-name>')
    .requiredOption(
      '-d, --display-name <display_name>',
      'Display name of the application'
    )
    .requiredOption(
      '-c, --owner-company <company_name>',
      'Name of your company that is building the game'
    )
    .requiredOption(
      '-e, --owner-email <owner_email>',
      'Email address used as a contact in privacy policy'
    )
    .action(actionAsync);
  await program.parseAsync(process.argv);
}
