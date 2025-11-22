import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import yaml from "yaml";
import { SystemsData } from "@/lib/systems-data";

export async function GET() {
  try {
    // Read YAML file from src/data directory
    const yamlPath = join(
      process.cwd(),
      "src",
      "data",
      "avrm_systems_data.yaml"
    );

    const fileContents = readFileSync(yamlPath, "utf8");
    const data = yaml.parse(fileContents);

    // Transform to SystemsData format
    const systemsData: SystemsData = {
      version: data.version || "1.0.0",
      last_updated: data.last_updated || new Date().toISOString().split("T")[0],
      functions: data.functions || [],
      tasks: data.tasks || [],
      assets: data.assets || [],
      process_flows: data.process_flows || [],
    };

    return NextResponse.json(systemsData);
  } catch (error) {
    console.error("Error reading YAML file:", error);
    return NextResponse.json(
      { error: "Failed to load systems data" },
      { status: 500 }
    );
  }
}
