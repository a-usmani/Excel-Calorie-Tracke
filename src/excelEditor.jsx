import React, { useState } from 'react';
import XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function SpreadsheetEditor(props) {
  const [spreadsheet, setSpreadsheet] = useState(null);

  //set the imported file
  const handleFileChange = event => {
    const file = event.target.files[0];
    setSpreadsheet(file);
  };

  //delete the last row
  function delete_row(ws, row_index){
    let variable = XLSX.utils.decode_range(ws["!ref"])
    variable.e.r--
    ws['!ref'] = XLSX.utils.encode_range(variable.s, variable.e);
  }

  //add data from App component state variable 'excelData' 
  const addData = (worksheet) => {
    const additions = props.data
    for (let i = 0 ; i < additions.length ; i++){
      const newRow = [additions[i].name, additions[i].calories, additions[i].carbohydrates_total_g, additions[i].fat_saturated_g, additions[i].fat_total_g, additions[i].fiber_g, additions[i].protein_g, additions[i].serving_size_g, additions[i].date]
      XLSX.utils.sheet_add_aoa(worksheet, [newRow], { origin: -1 });
    }
  }

  //get range of rows as int
  const getRange = (worksheet) => {
    const range = XLSX.utils.decode_range(worksheet['!ref'])
    return range.e.r
  }

  //find the rows with the same date and add the stats in one object
  const findDate = (worksheet, date, startRange) => {
    const groupedData = 
      {
        calories:0,
        carbs:0,
        satfat:0,
        fat:0,
        fiber:0,
        protein:0
      }
    const range = XLSX.utils.decode_range(worksheet['!ref'])
    for (let R = startRange; R <= range.e.r; ++R){
      const cellAddress = XLSX.utils.encode_cell({r: R, c: 8})
      const cell = worksheet[cellAddress];
      if (cell && cell.v === date) {
        groupedData.calories += worksheet[XLSX.utils.encode_cell({r: R, c: 1})].v
        groupedData.carbs += worksheet[XLSX.utils.encode_cell({r: R, c: 2})].v
        groupedData.satfat += worksheet[XLSX.utils.encode_cell({r: R, c: 3})].v
        groupedData.fat += worksheet[XLSX.utils.encode_cell({r: R, c: 4})].v
        groupedData.fiber += worksheet[XLSX.utils.encode_cell({r: R, c: 5})].v
        groupedData.protein += worksheet[XLSX.utils.encode_cell({r: R, c: 6})].v
      }
    }
    return groupedData
  }

  //exporting the sheet
  const handleExport = (props) => {
    if (spreadsheet) {
      const reader = new FileReader();
      reader.onload = event => {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        // Process the workbook and make updates
      
        // Access the first sheet in the workbook
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        let range = 0

        //get todays date
        const d = new Date()
        const d2 = d.toString().substr(4, 11)

        //add column descriptions for empty sheet
        if (Object.keys(worksheet).length === 0)
          XLSX.utils.sheet_add_aoa(worksheet, [['','calories (g)','carbs (g)','saturated fat (g)','fat (g)','fiber (g)','protein (g)','size (g)']], { origin: 0 })
        else {
          range = getRange(worksheet)
          console.log(range)
          
          //check if there is already a total for today, if so deletes it
          if (worksheet[XLSX.utils.encode_cell({r: range, c: 0})] && worksheet[XLSX.utils.encode_cell({r: range, c: 0})].v === d2){
            delete_row(worksheet, range)
            //going backwards in the sheet so the findDate function gets the previous entries for today as well
            for (let i = range-1 ; i >=0 ; i--){
              range=i
              if (worksheet[XLSX.utils.encode_cell({r: range, c: 8})] && worksheet[XLSX.utils.encode_cell({r: range, c: 8})].v !== d2)
                break;
            }
          }
        }
        //add selected foods from the App to the excel sheet
        addData(worksheet)
        //call findDate
        const todayStats = findDate(worksheet, d2, range)

        // new row for total stats today
        const newRow = [d2, todayStats.calories, todayStats.carbs, todayStats.satfat, todayStats.fat, todayStats.fiber, todayStats.protein]
        XLSX.utils.sheet_add_aoa(worksheet, [newRow], { origin: -1 });

        // Export the modified workbook
        const updatedSpreadsheet = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
        saveAs(new Blob([s2ab(updatedSpreadsheet)], { type: 'application/octet-stream' }), 'modified_spreadsheet.xlsx');
      };
      reader.readAsBinaryString(spreadsheet);
    }
  };
//function for exporting the code
  const s2ab = s => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleExport}>Export</button>
    </div>
  );
}
