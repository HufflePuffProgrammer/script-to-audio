export function arrayToHashmap(array: any[]){
    const hashmap = new Map();
    return array.reduce((acc, item)=>{
        acc.set(item.character_name, item.voice_id);
        return acc;
    }, hashmap);
}