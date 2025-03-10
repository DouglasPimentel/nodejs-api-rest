import type { Repository } from "typeorm";
import { AppDataSource } from "#/database/data-source";
import { Tool } from "#/modules/tool/tool.entity";

export async function getAllTools() {
  const toolRepository: Repository<Tool> = AppDataSource.getRepository(Tool);

  const tools: Tool[] = await toolRepository.find();

  return tools;
}

export async function checkToolExistsByName(
  name: string
): Promise<Tool | null> {
  const toolRepository: Repository<Tool> = AppDataSource.getRepository(Tool);

  const tool: Tool | null = await toolRepository.findOneBy({ name });

  return tool;
}

export async function createTool(
  name: string,
  description: string,
  website: string
): Promise<Tool> {
  const toolRepository: Repository<Tool> = AppDataSource.getRepository(Tool);

  const tool: Tool = new Tool(name, description, website);

  const newTool: Tool = await toolRepository.save(tool);

  return newTool;
}

export async function toolById(id: string): Promise<Tool | null> {
  const toolRepository: Repository<Tool> = AppDataSource.getRepository(Tool);

  const tool: Tool | null = await toolRepository.findOneBy({ id });

  return tool;
}

export async function updateTool(
  id: string,
  name: string,
  description: string,
  website: string
): Promise<void> {
  const toolRepository: Repository<Tool> = AppDataSource.getRepository(Tool);

  await toolRepository.update(id, {
    name,
    description,
    website,
  });
}

export async function deleteTool(id: string) {
  const toolRepository: Repository<Tool> = AppDataSource.getRepository(Tool);

  await toolRepository.delete({ id });
}
