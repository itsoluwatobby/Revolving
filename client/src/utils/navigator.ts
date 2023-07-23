export type ComponentKey = 'GENERAL' | 'ENTERTAINMENT' | 'WEB DEVELOPMENT' | 'REACT' | 'NODE' | 'BASH SCRIPTING'
export type Components = 'General' | 'Entertainment' | 'Web Development' | 'React' | 'Node' | 'Bash scripting'

export const REFRESH_RATE = 15_000 as const

export const NAVIGATE: Record<ComponentKey, Components> = {
  'GENERAL': 'General',
  'ENTERTAINMENT': 'Entertainment',
  'WEB DEVELOPMENT': 'Web Development',
  'REACT': 'React',
  'NODE': 'Node',
  'BASH SCRIPTING': 'Bash scripting'
}

type Option = 'letter' | 'word'

export const ErrorStyle = {
  duration: 10000, 
  icon: '💀', 
  style: {
    background: '#FF0000', 
    color: '#FFFFFF',
    fontSize: '13px'
  }
}

export const SuccessStyle = {
  duration: 2000, 
  icon: '🔥', 
  style: { 
    background: '#3CB371' 
  }
}

export const reduceLength = (content: string, maxLength: number, option: Option = 'letter'): string => {
  let responseOutput: string;
  if(option == 'letter'){
    responseOutput = content?.length > maxLength ? content?.substring(0, maxLength) +'...' : content
  }
  else{
    responseOutput = content?.split(' ').length > maxLength ? content?.substring(0, maxLength * 4) +'...' : content
  }

  return responseOutput
}

export const checkCount = <T>(content: T[]): string => {
  let count = '';
  if(content?.length <= 999){
    if(content?.length == 1 && content[0] == '') count = '0'
    else count = content?.length.toString()
  }
  else if(content?.length > 999 && content?.length <= 999_999)
    count = (content?.length / 1000).toString() + 'K'
  else if(content?.length > 999_999 && content?.length <= 999_999_999)
    count = (content?.length / 1000_000).toString() + 'M'
  else if(content?.length > 999_999_999)
    count = (content?.length / 1000_000_000).toString() + 'B'
  return count
}

