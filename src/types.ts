export type SkillMetadata = {
    name: string;
    description: string;
    skillDir: string;
    skillFile: string;
  };
  
  export type ParsedSkill = SkillMetadata & {
    instructions: string;
    raw: string;
  };
  
  export type SkillSelection =
    | {
        useSkill: true;
        skillName: string;
        reason: string;
      }
    | {
        useSkill: false;
        reason: string;
      };