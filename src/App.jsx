import React from 'react'
import './App.css'
import Excel from './excelEditor'
import { nanoid } from 'nanoid'

export default function App() {
  const [count, setCount] = React.useState([])
  const [formData, setFormData] = React.useState(
    {
        searchbar: "", 
    }
)

  const [excelData, setExcelData] = React.useState([])
  const [start, setStart] = React.useState(true)
  const [selectedId, setSelectedId] = React.useState()

  function dateNow() {
    const d = new Date()
    const d2 = d.toString().substr(4, 11)
    return d2
  }

  //get calorie ninja api
  function yo(event) {
    event.preventDefault()
    fetch(`https://api.calorieninjas.com/v1/nutrition?query=${formData.searchbar}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': '9AWK9Jt/hdW4RBKFSPPApQ==zDIOA8e7Ci1fw8hJ'
      },
    })
      .then(response => response.json())
      .then(data => {
        setCount(data.items.map(x => {
          return { ...x, selected: false, date: dateNow(), id: nanoid() }
        }))
      })
      .catch(err => {
        console.error(err)
       });
  }

//change form data
function handleChange(event) {
    const {name, value} = event.target
    setFormData(prevFormData => {
        return {
            ...prevFormData,
            [name]: value
        }
    })
}

//set selcted food using id
function selected(id){
  setCount(value => value.map(x => {
    if (x.id===id.id){
      return {
        ...x,
        selected: !x.selected
      }
    }
    else{
      return x
    }
  }))
  setSelectedId(id.id)
}

//unselect items after submit clicked and add to state of items added to the excel sheet
function submitItems(){
  setCount ( value => value.map(x => {
    return {
      ...x,
      selected: false
    }
  }))

  setExcelData( previousData => {
    const selected = count.filter(x => x.selected===true)
    let newData = []
    if (previousData.length !== 0){
      newData = newData.concat(previousData)
    }
    newData = newData.concat(selected)
    return newData
  })
}

//buttons for food items
function dropDown() {
  const results = count.map((x) => {
    return (<>
      <button
      key={x.id}
        id={x.id}
        onClick={() => selected(x)}
        className={x.selected ? "selected" : "notSelected"}
      >
        {x.name}
      </button>
      {selectedId === x.id && x.selected ? <div>Calories: {x.calories}<br/>Carbs: {x.carbohydrates_total_g}g<br/>Saturated fat: {x.fat_saturated_g}g<br/>Fat: {x.fat_total_g}g<br/>Fiber: {x.fiber_g}g<br/>Protein: {x.protein_g}g<br/>Serving size: {x.serving_size_g}g</div> : <></>}
      </>
    );
  });
  return results;
}

function submitButton() {
  if (count.length > 0){
    return (
      <button onClick={() => submitItems()}>Submit items</button>
    )
  }
}

return (
  <div>{start ?
    <div>
      <h2>Excel Calorie Tracker</h2>
      <p>Input your excel sheet and search for your food items with size (ie 5g, 8oz) and add them to your document</p>
      <button onClick={() => setStart(false)}>Start</button>
    </div>
    :<div>
    <form className="form" onSubmit={yo}>
        <input
            type="text"
            placeholder="enter food item(s)"
            onChange={handleChange}
            name="searchbar"
            value={formData.searchbar}
        />
        <button type="submit">
          Search
        </button>
    </form><div className="options">
        {dropDown()}
        {submitButton()}</div>
        <Excel data={excelData}/>
  </div>
}
  </div>
  )
}

