
export type ComponentKey = 'GENERAL' | 'ENTERTAINMENT' | 'WEB DEVELOPMENT' | 'REACT' | 'NODE' | 'BASH SCRIPTING'
export type Components = 'General' | 'Entertainment' | 'Web Development' | 'React' | 'Node' | 'Bash scripting'

export const NAVIGATE: Record<ComponentKey, Components> = {
  'GENERAL': 'General',
  'ENTERTAINMENT': 'Entertainment',
  'WEB DEVELOPMENT': 'Web Development',
  'REACT': 'React',
  'NODE': 'Node',
  'BASH SCRIPTING': 'Bash scripting'
}

type Option = 'letter' | 'word'

export const reduceLength = (content: string, maxLength: number, option: Option = 'letter'): string => {
  let responseOutput;
  if(option == 'letter'){
    responseOutput = content?.length > maxLength ? content?.substring(0, maxLength) +'...' : content
  }
  else{
    responseOutput = content?.split(' ').length > maxLength ? content?.substring(0, maxLength * 4) +'...' : content
  }

  return responseOutput
}

export const checkCount = <T>(content: T[]): string => {
  const count = content?.length > 1000 ? (content?.length / 1000).toString() + 'k' : content?.length.toString()
  return count
}
