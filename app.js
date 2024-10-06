const fs = require('fs');

const sparseMatrix = (filePathOrRows, cols = null) => {
  const elements = new Map();
  let rows, columns;

  const get = (r, c) => elements.get(`${r},${c}`) || 0;
  const set = (r, c, val) => val !== 0 ? elements.set(`${r},${c}`, val) : elements.delete(`${r},${c}`);

  const loadFile = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8').trim();
    const dataLines = content.split('\n').map(line => line.trim());

    console.log('File content:', content); 
    console.log('Parsed lines:', dataLines); 

    if (!dataLines[0].startsWith('rows=') || !dataLines[1].startsWith('column=')) throw new Error('Input file has wrong format');

    rows = parseInt(dataLines[0].split('=')[1]);
    columns = parseInt(dataLines[1].split('=')[1]);

    dataLines.slice(2).forEach(line => {
      const match = line.match(/^\((\d+),\s*(\d+),\s*(-?\d+)\)$/);
      if (!match) throw new Error('Input file has wrong format');
      const [, r, c, val] = match;
      set(parseInt(r), parseInt(c), parseInt(val));
    });
  };

  if (typeof filePathOrRows === 'string') {
    loadFile(filePathOrRows);
  } else {
    rows = filePathOrRows;
    columns = cols;
  }

  const matrixOp = (matrix, op) => {
    if (rows !== matrix.rows || columns !== matrix.cols) throw new Error('Matrix dimensions do not match for operation');
    const result = sparseMatrix(rows, columns);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const val = op(get(r, c), matrix.get(r, c));
        if (val !== 0) result.set(r, c, val);
      }
    }
    return result;
  };

  const add = (matrix) => matrixOp(matrix, (a, b) => a + b);
  const subtract = (matrix) => matrixOp(matrix, (a, b) => a - b);

  const multiply = (matrix) => {
    if (columns !== matrix.rows) throw new Error('Matrix dimensions are not compatible for multiplication');
    const result = sparseMatrix(rows, matrix.cols);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < matrix.cols; c++) {
        let sum = 0;
        for (let k = 0; k < columns; k++) sum += get(r, k) * matrix.get(k, c);
        if (sum !== 0) result.set(r, c, sum);
      }
    }
    return result;
  };

  return { rows, cols: columns, get, set, add, subtract, multiply, elements };
};

const performOp = (filePath1, filePath2, op) => {
  const matrix1 = sparseMatrix(filePath1);
  const matrix2 = sparseMatrix(filePath2);

  switch (op) {
    case 'add': return matrix1.add(matrix2);
    case 'subtract': return matrix1.subtract(matrix2);
    case 'multiply': return matrix1.multiply(matrix2);
    default: throw new Error('Invalid operation');
  }
};

const op = 'add';
const filePath1 = './sample_input_for_students-20241005T203704Z-001/sample_input_for_students/matrixfile1.txt';
const filePath2 = './sample_input_for_students-20241005T203704Z-001/sample_input_for_students/matrixfile3.txt';

try {
  const result = performOp(filePath1, filePath2, op);
  console.log(result);
} catch (error) {
  console.error('Error:', error.message);
}