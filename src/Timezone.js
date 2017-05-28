import React from 'react';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import {GridTile} from 'material-ui/GridList';
import ProgressiveImage from 'react-progressive-image';
import Timestamp from 'react-timestamp';

const titleStyle = {marginTop: '-30px', marginBottom: '-30px'};

function displayOffset(tzOffset) { //
  return ((tzOffset > 0) ? '+' : '') + (tzOffset / 60);
}

//Props: timeZone, index, dragged, onDrag(clientX, index), onDelete(index)
export default function Timezone(props) {
  const timeZone = props.timeZone;
  const index = props.index;
  const dragged = props.dragged;
  const tzImg = <ProgressiveImage src={timeZone.imgSrc} placeholder={timeZone.thumbSrc}>
      {(src) => <img className="leftImg" src={src} alt={timeZone.name}/>}
    </ProgressiveImage>;
  const tzDelete = index ? (<ActionDelete 
      color='#DDD' className='delete'
      onTouchTap={() => props.onDelete(index)}
    />) : <div/>;
  const header = <div className={'header col' + (index % 4)}/>;
  const time = <h1 className='time'>
      <Timestamp time={timeZone.timestamp} format='time' utc={false}/></h1>;
  const offset = <h3 className='offset'>GMT {displayOffset(timeZone.offset)}</h3>;
  return (<GridTile
            onMouseDown={(e) => {props.onDrag(e.clientX, index); e.preventDefault()}}
            className={'tz' + (dragged ? ' dragged' : '')}
            key={index} title={time}
            subtitle={<div className='subtitle'>
              <h1 className='city'>{timeZone.name}</h1>{offset}</div>}
            titleBackground='rgba(0, 0, 0, 0)'
            titleStyle={titleStyle}>
          {header}{tzDelete}{tzImg}
        </GridTile>);
}