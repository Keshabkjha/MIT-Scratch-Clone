import React from "react";
import { EventBody } from './Components/eventBody'
import { useState } from 'react';
import { NavBar } from './Components/navBar';
import { DragDropContext} from "react-beautiful-dnd";
import { moves as initialMoves } from "./data/moves";

export default function App() {
  const [moves, setMoves] = useState(initialMoves);
  const [actions, setActions]= useState([]);
  const [actions2, setActions2]= useState([]);
  
  const onHandleDragEnd = (result) =>{
    const {source, destination} = result;
    console.log(source, destination)
    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    let add , 
      active = [...moves],
      complete = [...actions],
      complete2 = [...actions2]; 

    // take a move to drag and drop 
    add = active[source.index];

    // Destination Logic
    const isFirstActionList = destination.droppableId === "MovesActions";
    const nextActions = isFirstActionList ? [...complete, add] : complete;
    const nextActions2 = isFirstActionList ? complete2 : [...complete2, add];
    setActions(nextActions);
    setActions2(nextActions2);
    setMoves(active);
  }
  
  return (
    <div className="bg-blue-100 font-sans text-center">
      <NavBar/>
        <DragDropContext onDragEnd={onHandleDragEnd}>
          <EventBody 
            moves={moves} 
            setMoves={setMoves} 
            actions={actions}
            actions2={actions2}
            setActions2={setActions2}
            setActions={setActions}  
          />
        </DragDropContext>
    </div>
  );
}
