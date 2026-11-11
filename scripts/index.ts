import { GraphValidator } from './parser';
import * as path from 'path';

const main = () => {
  console.log('Cargando validador de integridad para Spark Encyclopedia...\n');
  const graphPath = path.join(__dirname, '../spark_pipeline_architecture.json');
  const referencePath = path.join(__dirname, '../spark_reference.json');

  try {
    const validator = new GraphValidator(graphPath, referencePath);
    const result = validator.validate();

    if (!result) {
      console.error('\nFalló la validación de integridad de datos.');
      process.exit(1);
    } else {
      console.log('\nÉxito. Todos los archivos JSON fueron validados estructuralmente.');
    }
  } catch (error) {
    console.error('Error procesando los archivos JSON:', error);
    process.exit(1);
  }
};

main();
