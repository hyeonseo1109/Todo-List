import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [isLoading, data] = useFetch("http://localhost:3000/todo");
  //json server에서 받아옴
  const [todo, setTodo] = useState([]);
  const [currentTodo, setCurrentTodo] = useState(null);
  const [time, setTime] = useState(0)
  const [isTimer, setIsTimer] = useState(false);

  useEffect( () => {
    if (currentTodo) {  
      //currentTodo가 있으면
      const current = todo.find( (el) => el.id === currentTodo);
      //현재 선택한 아이디랑 같은 아이디를 찾아서 걔를 current라고 할 거다.
      if (!current) {
        setCurrentTodo(null);
        return;
      }
      fetch(`http://localhost:3000/todo/${currentTodo}`, {
        method: "PATCH",
        //GET: 데이터 조회, POST: 데이터 생성, PUT: 전체 덮어쓰기, PATCH: 일부 필드만 수정, DELETE: 데이터 삭제
        body: JSON.stringify({ 
          time: todo.find((el) => el.id === currentTodo).time + 1
          //리스트별 타이머. 선택된 애의 time속성을 1씩 늘림
        }),
      })
      .then( (res) => res.json())
      .then( (res) => 
        setTodo( (prev) => 
          prev.map((el) => (el.id === currentTodo ? res : el ))
        )
      );
    }
  }, [time])

  useEffect( () => {
    setTime(0);
  }, [isTimer]);
  //타이머로 변경될 때마다 0초로 만듦
  
  useEffect( () => {
    if (data) {
      setTodo(data);
    }
  }, [isLoading, data]);

  return (
    <>
      <h1 className='title'>TODO LIST</h1>
      <Clock />
      <Advice />
      <div className="time">
        <button onClick={() => setIsTimer(prev => !prev)}>{isTimer ? "스톱워치로 변경" : "타이머로 변경"}</button>
        {isTimer ? ( <Timer time={time} setTime={setTime}/> ) : (<StopWatch time={time} setTime={setTime}/>)}
      </div>
      <div className="listContent">
        <TodoList todo={todo} setTodo={setTodo} setCurrentTodo={setCurrentTodo} currentTodo={currentTodo}/>
        <TodoInput setTodo={setTodo}/>
      </div>
      <Giraffe />
    </>
  )
}

const useFetch = (url) => {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState(null);

  useEffect( () => {
    fetch(url)
      .then( (res) => res.json())
      .then( (res) => {
        setData(res);
        setIsLoading(false);
      });
  }, [url]);
  return [isLoading, data]
}

const Advice = () => {
  const [isLoading, data] = useFetch("https://korean-advice-open-api.vercel.app/api/advice");
  return (
    <>
      {!isLoading && (
        <>
        {/* <p>
          𓏧 𓏲 𓏲 𓏲 𓋒𓏲 𓏲 𓏲 𓏲 𓏧 𓏲 𓏲 𓏲 𓋒𓏲 𓏲 𓏲 𓏲 𓏧 𓏲 𓏲 𓏲 𓋒𓏲 𓏲 𓏲 𓏲 𓏧
        </p>
        <p>
          ‧̍̊˙· 𓆝.° ｡˚𓆛˚｡ °.𓆞 ·˙‧̍̊𓆝.° ｡˚𓆛˚｡ °.𓆞 ·˙‧̍̊
        </p> */}
        <Hellokitty />
        


        <p>"
          <div>{data.message}</div>
        "</p>
          <div className='author'>-{data.author}-</div>
          <hr />
        </>
      )}
    </>
  )
}

const Timer = ({ time, setTime }) => {
  const [startTime, setStartTime] = useState(0)
  const [isOn, setIsOn] = useState(false)
  //우선 처음에는 꺼놓은 상태로 시작
  const timerRef = useRef(null)

  useEffect( () => {
    if (isOn && time >0) {
      //타이머가 켜져있고 시간이 아직 남아있으면?
      const timerId = setInterval( () => {
        setTime( (prev) => prev -1)
      }, 1000);
      //1초마다 감소되게끔.
      timerRef.current = timerId
      //값이 바뀌어도 리렌더링 되지 않는 ref 이용, 타이머 아이디를 저장하고 clear함
    } else if (!isOn || time === 0) {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current)
  }, [isOn, time])

  return (
    <div>
        <input 
          className="swCss"
          type="range" 
          value={startTime} 
          //startTime값이랑 똑같게 연결해줌
          min="0"
          max='2400'
          step="5"
          onChange={ (event) => setStartTime(event.target.value) } 
        />
  
      <div className='swFormat'>
        {time ? formatTime(time) : formatTime(startTime)} 
        {/*스톱워치에 이미 지정된 시간이 있으면 그걸 포맷화해서 띄우고 아님 시작시간 띄우기*/}
        <div className="swBtCss">
          <button onClick={ () => {
            setIsOn(true);
            setTime(time ? time : startTime);
            setStartTime(0);
            }}>
              시작
          </button>
          <button onClick={ () => setIsOn(false)}>멈춤</button>
          <button onClick={ () => {
          setTime(0);
          setIsOn(false);
          }}>
            리셋
          </button>
        </div>

      </div>

    </div>
  )
}



const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect( () => {
    setInterval( () => {
      setTime(new Date())
      //1초에 한번씩 time을 new Date로 불러와줌
    }, 1000)
  }, [])
  //처음 한 번 마운트될 떄만 렌더링되지만 인터벌이 1초마다 시간 바꿔줌

  return (
    <div className='clock'>
      {time.toLocaleTimeString()}
    </div>
  )
}

const formatTime = (seconds) => {
  // 12345초가 있으면
  // 12345/3600 (절대값) -> 시간
  // (12345 % 3600) / 60 (절대값) -> 분
  // 12345 % 60 -> 초
  const timeString = `${String(Math.floor(seconds/3600)).padStart(2, "0")}:${String(Math.floor((seconds%3600) /60)).padStart(2, "0")}:${String(seconds%60).padStart(2, "0")}`;
  return timeString;
}

const StopWatch = ({ time, setTime }) => {
  const [isOn, setIsOn] = useState(false);
  const timerRef = useRef(null)

  useEffect( () => {
    if (isOn === true) {
      const timerId = setInterval( () => {
        setTime( (prev) => prev +1);
      }, 1000);
      timerRef.current = timerId;
    } else {
      clearInterval(timerRef.current);
    }
  }, [isOn]);

  return (
    <div className="tmFormat">
      {formatTime(time)}
      <div>
        <button onClick={ () => setIsOn( (prev) => !prev )}>{isOn ? "끄기" : "켜기"}</button> {/*토글.. 누르면 반대의 상태가 됨*/}
        <button onClick={() => {
          setTime(0);
          setIsOn(false);
        }}>리셋</button>
      </div>
    </div>
  )
}








const TodoList = ( {todo, setTodo, setCurrentTodo, currentTodo }) => {
  return (
      <ul>
        {todo.map( (el) => (  //투두를 받아와서 map으로 .. 컴포넌트 하나씩 생성해서 뿌림
          <Todo key={todo.id} todo={el} setTodo={setTodo} setCurrentTodo={setCurrentTodo} currentTodo={currentTodo}/>
        ))}
      </ul>
  )
}

const Todo = ({ todo, setTodo, setCurrentTodo, currentTodo }) => {
  return (
    <>
      <li className={currentTodo === todo.id ? 'current list' : "list"}>
        {/*지금 선택된 애는 따로 클래스 더 지정해줌*/}
        <div>
          {todo.content}  
            {/*TodoList에서 map으로 뿌려준 하나하나의 리스트를 보여줌 */}
        </div>
        <div className='listBts'>
          {formatTime(todo.time)}
          <div className="listBt">
            <button
              onClick={() => setCurrentTodo(todo.id)}>시작하기</button>
            <button onClick={ () => {
              fetch(`http://localhost:3000/todo/${todo.id}`, {
                method: "DELETE",
              })
              .then( (res) => {
                if (res.ok) {
                  setTodo(prev => prev.filter(el => el.id !== todo.id))
                    //내가 택한 것과 아이디가 다른 애들만 남긴다. = 내가 택한 애는 없어진다.
                }
              })
            }}>삭제</button>
          </div>
          

          
        </div>
      </li>
    
      <hr className='dashed'/>
    </>
  )
}

const TodoInput = ({ setTodo }) => {
  const inputRef = useRef(null);

  const addTodo = () => {
    const newTodo = {
      content: inputRef.current.value,
      time: 0,
    };
    fetch("http://localhost:3000/todo", {
      method: "POST", //데이터 전송
      body: JSON.stringify(newTodo),
    })
    .then( (res) => res.json())
    .then( (res) => setTodo( (prev) => [...prev, res])) //이전 내용에 새로 추가된 내용을 넣어줌
    inputRef.current.value = '' //추가되면 입력창을 비워줌
  };
  return (
    <div className='todoInput'>
      <input ref={inputRef} className='input'/>
      <button onClick={addTodo}>추가</button> 
      {/* 버튼 누르면 리스트 추가하는 함수 실행 */}
    </div>
  )
}


const Giraffe = () => (
  <pre className='giraffe'>
  {`
    　　(/ΩΩ/)
  　　 / •• /
  　　(＿ノ |
  　　　 |　|
  　　　 |　|
  　　 __|　|＿
  　　/ヘ　　/ )
  　　Lニニコ/
  　　|￣￣￣|
  　　     |　　　|――≦彡
  　　|　∩  |
  　　|　|| |
  　　|　||　|
  　　|二||二|
  `}
  </pre>
);


const Hellokitty = () => (
  <p className="kitty">
      ＾   <span style={{color:"rgb(238, 0, 0)"}}>0o0</span>&nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <br/>
      ミ <span style={{fontWeight:"900"}}>・</span> <span style={{color:"rgb(255, 225, 0)", fontWeight:"900"}}>。</span><span style={{fontWeight:"900"}}>・</span> ミ&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <br/>
      —<span style={{fontSize:"0.7em"}}>○</span>———<span style={{fontSize:"0.7em"}}>○</span>——————————<br/>
  </p>
)

export default App
