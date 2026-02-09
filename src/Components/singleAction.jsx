import React from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import './styles.css';
import { Draggable } from "react-beautiful-dnd";
import { CATEGORIES } from "../constants";
import Tooltip from '@mui/material/Tooltip';

export const SingleAction = (props) => {
  const { move, moves, setMoves, index, disableDelete=false, refresh} = props;

  const handleDelete = (idx) => {
    let active = moves;
    active.splice(idx, 1);
    let arr = [];
    setMoves(arr.concat(active));
    // Call refresh to reset all states and positions
    if (refresh) {
      refresh();
    }
  };

  const getActionDescription = (todo) => {
    switch(todo) {
      case 'Move 50 steps': return 'Move sprite forward by 50 steps';
      case 'Move -50 steps': return 'Move sprite backward by 50 steps';
      case 'Move up 50 steps': return 'Move sprite upward by 50 steps';
      case 'Move down 50 steps': return 'Move sprite downward by 50 steps';
      case 'Go to x: 0 y: 0': return 'Move sprite to center position (coordinates 0,0)';
      case 'Go to coordinates': return 'Move sprite to specified X,Y coordinates';
      case 'turn 360 degrees': return 'Rotate sprite in a full circle (360 degrees)';
      case 'turn 90 degrees': return 'Rotate sprite by 90 degrees clockwise';
      case 'turn 135 degrees': return 'Rotate sprite by 135 degrees clockwise';
      case 'turn 180 degrees': return 'Rotate sprite by 180 degrees';
      case 'show': return 'Make the sprite visible';
      case 'hide': return 'Make the sprite invisible';
      case 'Say Hello for 5 sec': return 'Display "Hello!" message for 5 seconds';
      case 'Think Hmmm for 3 sec': return 'Show thinking bubble with "Hmmm..." for 3 seconds';
      case 'Say Bye': return 'Display "Bye!" message';
      case 'Say Hii': return 'Display "Hii!" message';
      case 'Think See you': return 'Show thinking bubble with "See you..."';
      case 'Go to random position': return 'Move sprite to a random position on screen';
      case 'size increase': return 'Increase sprite size';
      case 'size decrease': return 'Decrease sprite size';
      case 'Set size small': return 'Set sprite to small size';
      case 'Set size medium': return 'Set sprite to medium size';
      case 'Set size large': return 'Set sprite to large size';
      case 'repeat': return 'Repeat all above actions';
      case 'Play Meow Sound': return 'Play a cat meow sound effect';
      case 'Play Pop Sound': return 'Play a popping sound effect';
      case 'Play Bell Sound': return 'Play a bell ringing sound';
      case 'Play Drum Beat': return 'Play a drum beat sound';
      case 'Play Piano Note': return 'Play a piano note sound';
      case 'Play Laugh Sound': return 'Play a laughing sound effect';
      case 'Increase Volume': return 'Increase the volume of sound effects';
      case 'Decrease Volume': return 'Decrease the volume of sound effects';
      case 'Wait 1 second': return 'Pause actions briefly for one second';
      case 'Stop all': return 'Stop all running actions immediately';
      case 'When green flag clicked': return 'Trigger an event when the green flag is clicked';
      case 'When sprite clicked': return 'Trigger an event when a sprite is clicked';
      case 'Broadcast message': return 'Broadcast a message to all sprites';
      case 'Touching sprite?': return 'Check whether sprites are touching';
      case 'Touching edge?': return 'Check whether the sprite is touching the stage edge';
      case 'Sprite position report': return 'Report the current sprite position';
      case 'Pick random 1 to 10': return 'Pick a random number between 1 and 10';
      case 'Add 5 + 10': return 'Compute 5 + 10';
      case 'Is score > 10?': return 'Check whether score is greater than 10';
      case 'Set score to 0': return 'Reset score to 0';
      case 'Change score by 1': return 'Increase score by 1';
      case 'Change score by -1': return 'Decrease score by 1';
      case 'Custom spin': return 'Run a custom spin block';
      case 'Custom bounce': return 'Run a custom bounce block';
      default: return todo;
    }
  };

  const actionBlock = (
    <div 
      className="moves__single"
      style={{
        backgroundColor: CATEGORIES[move.category]
      }}
      role="button"
      aria-label={getActionDescription(move.todo)}
    >
      <Tooltip 
        title={getActionDescription(move.todo)}
        placement="right"
        arrow
      >
        <span className="moves__single--text">{move.todo}</span>
      </Tooltip>
      {!disableDelete && (
        <div>
          <span 
            className="icon" 
            onClick={() => handleDelete(index)}
            role="button"
            aria-label="Delete action"
          >
            <DeleteIcon sx={{":hover":{cursor:'pointer'}}} />
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div>  
      {disableDelete ? (
        <Draggable key={move.id} draggableId={move.id.toString()} index={index}>
          {(provided) => (
            <div 
              {...provided.draggableProps}    
              {...provided.dragHandleProps} 
              ref={provided.innerRef}
            >
              {actionBlock}
            </div>
          )}
        </Draggable>
      ) : actionBlock}
    </div>
  );
};

export default SingleAction;
