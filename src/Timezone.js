import React from 'react';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import KeyboardArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import KeyboardArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import Slider from 'material-ui/Slider';
import {GridTile} from 'material-ui/GridList';
import ProgressiveImage from 'react-progressive-image';
import moment from 'moment';
import Weather from './Weather';

const titleStyle = {marginTop: '-30px', marginBottom: '-30px'};
const sliderStyle = {height: 'calc(100% - 207px)', position: 'absolute', bottom: 0, opacity: 0.5, transition: 'all 0.3s ease', left: -10};
const sliderScale = 0.95;

function displayOffset(tzOffset) {
  return ((tzOffset >= 0) ? '+' : '') + (tzOffset / 60);
}

function toSlider(value) {
  return value * sliderScale;
}

function fromSlider(value) {
  const out = value / sliderScale;
  return (out < 0) ? 0 : (out > 1) ? 1 : out;
}

/* Props: timeZone, index, dragged, military, minutesDelta
   Callbacks: onDrag(clientX, index), onDelete(index), onChangeImage(tzIndex, imgIndex), onChangeDelta(minutesDelta)*/
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
  const currentMoment = new moment((timeZone.timestamp) * 1000).utc();
  const displayMoment = new moment((timeZone.timestamp + props.minutesDelta * 60) * 1000).utc();
  const timeStamp = displayMoment.format(props.military ? 'H:mm' : 'h:mma');
  const time = <h1 className='time'>{timeStamp}</h1>;
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
          className='tzbtn imgArrow rightArrow' />;
  const sliderPos = (displayMoment.hours() + (displayMoment.minutes() / 60)) / 24;
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
      <Slider
        onDragStart={(event) => event.stopPropagation()}
        value={toSlider(sliderPos)}
        onChange={(_, value) => {
          const newMinutes = Math.floor(fromSlider(value) * 24 * 60);
          const oldMinutes = currentMoment.hours() * 60 + currentMoment.minutes();
          const rounder = (newMinutes) % 15;
          props.onChangeDelta(newMinutes - oldMinutes - rounder);
        }}
        className='timeSlider' style={sliderStyle} axis='y-reverse'/>
      {leftArrow} {rightArrow}
    </GridTile>);
}