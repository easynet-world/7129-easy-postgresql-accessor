class ObjectUtility {

    camelToSnakeCase(str) {
        if (typeof str !== 'string') {
            throw new Error('Input must be a string');
        }
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1_$2').toLowerCase();
    }

    convertObjectToFlat(obj, parentKey = '') {
        if (obj === null || obj === undefined) {
            return {};
        }

        if (typeof obj !== 'object') {
            throw new Error('Input must be an object');
        }

        let flatObject = {};
        
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const newKey = this.camelToSnakeCase(parentKey ? `${parentKey}_${key}` : key);
                
                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    const childObject = this.convertObjectToFlat(obj[key], newKey);
                    flatObject = {...flatObject, ...childObject};
                } else {
                    flatObject[newKey] = obj[key];
                }
            }
        }
        
        return flatObject;
    }

}

module.exports = ObjectUtility;
