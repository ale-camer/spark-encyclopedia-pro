import { GraphValidator } from './core/parser';
import * as path from 'path';

const main = () => {
    console.log('Cargando parser para arquitectura Spark...\n');
    const jsonPath = path.join(__dirname, '../spark_pipeline_architecture.json');
    
    try {
        const validator = new GraphValidator(jsonPath);
        const result = validator.validate();

        if (!result) {
            console.error('\nFalló la validación del archivo JSON.');
            process.exit(1);
        } else {
            console.log('\nÉxito. El archivo JSON fue cargado y validado estructuralmente.');
        }
    } catch (error) {
        console.error('Error procesando el archivo JSON:', error);
        process.exit(1);
    }
};

main();
