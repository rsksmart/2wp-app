export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = () => {
      resolve(fileReader.result as string);
    };

    fileReader.onerror = () => {
      reject(new Error('Error on file reading'));
    };

    fileReader.readAsText(file);
  });
}
