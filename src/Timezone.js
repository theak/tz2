import React from 'react';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import KeyboardArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import KeyboardArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import {GridTile} from 'material-ui/GridList';
import ProgressiveImage from 'react-progressive-image';
import Timestamp from 'react-timestamp';
import Weather from './Weather';

const titleStyle = {marginTop: '-30px', marginBottom: '-30px'};

function displayOffset(tzOffset) {
  return ((tzOffset > 0) ? '+' : '') + (tzOffset / 60);
}

//Props: timeZone, index, dragged, onDrag(clientX, index), onDelete(index), onChangeImage(tzIndex, imgIndex)
export default function Timezone(props) {
  const timeZone = props.timeZone;
  const index = props.index;
  const dragged = props.dragged;
  const photo = timeZone.photos[timeZone.imgIndex || 0];
  const tzImg = (
    <ProgressiveImage src={photo.imgUrl} placeholder={photo.thumbUrl}>
      {(src) => <img className="leftImg" src={src} alt={timeZone.name}/>}
    </ProgressiveImage>
  );
  const tzDelete = index ? (
    <ActionDelete 
      color='#DDD' className='delete tzbtn'
      onTouchTap={() => props.onDelete(index)}
    />) : <div/>;
  const header = <div className={'header col' + (index % 4)}/>;
  const time = <h1 className='time'>
      <Timestamp time={timeZone.timestamp} format='time' utc={false}/></h1>;
  const offset = <h3 className='offset'>GMT {displayOffset(timeZone.offset)}</h3>;
  const leftArrow = (timeZone.imgIndex > 0) 
      ? <KeyboardArrowLeft color='#DDD'
          onMouseDown={(e) => e.stopPropagation()}
          onTouchTap={(event) => {
            props.onChangeImage(index, timeZone.imgIndex - 1);
          }}
          className='tzbtn imgArrow' />
      : <div/>;
  const rightArrow = <KeyboardArrowRight color='#DDD'
          onMouseDown={(e) => e.stopPropagation()}
          onTouchTap={(event) => {
            props.onChangeImage(index, (timeZone.imgIndex + 1) % timeZone.photos.length);
          }}
          className='tzbtn imgArrow rightArrow' />
  return (
    <GridTile
        onMouseDown={(e) => {props.onDrag(e.clientX, index); e.preventDefault()}}
        className={'tz' + (dragged ? ' dragged' : '')}
        key={index} title={time}
        subtitle={<div className='subtitle'>
          <h1 className={'city' + ((index === 0) ? ' pointer' : '')}
              onTouchTap={(index === 0) ? props.onEditHomeCity : () => {}}>
            {timeZone.name}
          </h1>
          {timeZone.name ? offset : <div/>}</div>}
        titleBackground='rgba(0, 0, 0, 0)'
        titleStyle={titleStyle}>
      {header} {tzDelete} {tzImg}
      <Weather location={timeZone.name} units={props.units} onToggleUnits={props.onToggleUnits} />
      {leftArrow} {rightArrow}
    </GridTile>);
}