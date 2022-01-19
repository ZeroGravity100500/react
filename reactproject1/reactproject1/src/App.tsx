import { createRef, useState } from 'react';
import './App.css';
import { Color } from './Color/Color';
import { CanvasComponent } from './Components/CanvasComponent';
import ColorPickerPanel from './Components/ColorPicker/ColorPickerPanel';
import { DialogWindow } from './Components/DialogWindow/DialogWindow';
import View from './Components/View';
import { PresetShapesList } from './Geom/Shapes2D';
import { Vector2D } from './Math/Vec2D';

function App() {
    const [color, setColor] = useState(new Color('transparent'));
    const [showDialog, setShowDialog] = useState(true);
    const [colorChoiceWindowPos, setColorWindowPos] = useState({x: 0, y: 0});

    const onClick = () => {
        setShowDialog(true);
    }

    const onClose = () => {
        setShowDialog(false);
    }

    const onColorChioseWindowMove = (pos: Vector2D) => {
        setColorWindowPos({x: pos.x, y: pos.y});
    }

    const onLoadClick = () =>{
        fetch('/presetShapeDefinitions.xml').then((value: Response) => {
            value.text().then((data: string) => {
                PresetShapesList.instance().load(data);
                console.log(PresetShapesList.instance().getPresetsNames());
            });
        }).catch((r: any) =>{
            //console.log(r);
        });
    }

    return (
        <div>
            <View text={'preView'} backgroundColor={color} />
            <button onClick={onClick}>{'Open'}</button>
            <button onClick={onLoadClick}>{'Load presets'}</button>

            <CanvasComponent width={1000} height={700} />
            {showDialog ?
                        <DialogWindow title='DemoDialog'
                          onMoveCallbeck={onColorChioseWindowMove} 
                          onClose={onClose}
                          x = { colorChoiceWindowPos.x !== 0 ? colorChoiceWindowPos.x : undefined } 
                          y = { colorChoiceWindowPos.y !== 0 ? colorChoiceWindowPos.y : undefined } 
                          children={
                                <ColorPickerPanel colorChangedCallback={setColor} />
                            }
                        /> :
                        null
            }
        </div>
    );
}

export default App;
