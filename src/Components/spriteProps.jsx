import React from "react";
import './styles.css';
import { Box } from "@mui/material";

export const Sprites = (props) => {
  const {sprite, sprite2, setSprite, setSprite2, displayAddIcon} = props;
  const spriteProps= [
      {
        id:0,
        src:require('../Assets/images/cat.png')
      },
      { 
        id:1,
        src: require('../Assets/images/jerry1.png')
      },
      {
        id:2,
        src:require('../Assets/images/Mickey_Mouse.png')
      },

  ];
  function handleClick(src) {
    displayAddIcon ? setSprite(src): setSprite2(src);
  };
  return (
    <Box 
        sx={{ 
            marginLeft:'5%',
            fontFamily:'monospace',
            display:'flex',
            maxWidth:'540px',
            height:'140px',
            flexDirection:'row',
            columnGap:'10px'
        }}
    >
        {spriteProps.map((item)=>(
            <Box
                key={item.id}
                sx={{
                    background:sprite !== item.src && sprite2 !== item.src ? 'white':'#4d97ff',
                    borderRadius:'20px',
                    maxHeight:'130px',
                    border: sprite === item.src || sprite2 === item.src ? '2px solid #0d6efd':'2px solid transparent',
                    ":hover":{
                       backgroundColor:'#4d97ff',
                       border:'2px solid #0d6efd',
                       cursor:'pointer'
                    }
                }}
                onClick={()=>handleClick(item.src)}
            >
                <img src={item.src} 
                    alt={`Sprite option ${item.id + 1}`}
                    style={{
                        marginBottom:'30px',
                        height:'120px',
                        width:'120px'
                    }}
                />
            </Box>
        ))}
    </Box>
  );
};

export default Sprites;
