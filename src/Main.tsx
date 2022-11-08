import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Chip,
  Avatar,
  useMediaQuery,
  Tab,
  Tabs,
  Card,
  CardContent,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import copy from 'copy-to-clipboard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <>
      {value === index && (
        <Box>
          <Typography>{children}</Typography>
        </Box>
      )}
    </>
  );
}

function Question({ idx, kr, en, onChange }: any) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [hints, setHints] = useState<string[]>([]);
  const [hintStep, setHintStep] = useState<number>(0);
  const [text, setText] = useState('');
  const [hint, setHint] = useState<string>('');

  useEffect(() => {
    if (en) {
      setHintStep(0);
      setText('');
      setHints(en.split(' '));
      setHint('');
    }
  }, [en]);

  function handleChange(text: string) {
    setText(text);
    onChange(text);
  }

  function handleNextHint() {
    let temp = '';
    setHintStep(hintStep + 1);
    for (let i = 0; i < Math.min(hintStep + 1, hints.length); i++) {
      temp += hints[i] + ' ';
    }
    setHint(temp);
  }

  function handleAllHint() {
    setHint(en);
    setHintStep(0);
  }

  function handleClearHint() {
    setHint('');
    setHintStep(0);
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: `${isMobile ? 'column' : 'row'}`,
          justifyContent: 'center',
          mt: 2,
          mx: isMobile ? 2 : 0,
        }}
      >
        <TextField
          fullWidth
          multiline
          label="한글"
          value={kr}
          variant="outlined"
          InputProps={{
            readOnly: true,
          }}
          sx={isMobile ? { mr: 5 } : { mr: 2 }}
          required
        />
        {isMobile && <Box sx={{ mt: 2 }} />}
        <TextField
          fullWidth
          multiline
          label="영어"
          value={' ' + hint}
          variant="outlined"
          InputProps={{
            readOnly: true,
          }}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: `${isMobile ? 'column' : 'row'}`,
          justifyContent: 'space-between',
          mx: isMobile ? 2 : 0,
          // p: 1,
          // m: 1,
        }}
      >
        {isMobile && <Box sx={{ mt: 2 }} />}
        <TextField
          fullWidth
          multiline
          label="답변"
          value={text}
          variant="standard"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setText(event.target.value);
            handleChange(event.target.value);
          }}
          sx={isMobile ? { mr: 5 } : { mr: 2 }}
          required
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexBasis: '100%',
            verticalAlign: 'bottom',
          }}
        >
          <Button sx={{ mt: 2 }} onClick={(e) => handleNextHint()}>
            Hint
          </Button>
          <Button sx={{ mt: 2 }} onClick={(e) => handleAllHint()}>
            All hint
          </Button>
          <Button sx={{ mt: 2 }} onClick={(e) => handleClearHint()}>
            Clear
          </Button>
        </Box>
      </Box>
    </>
  );
}

function Main() {
  const scrollBoxRef = useRef<HTMLUListElement>();
  const [data, setData] = useState<any>([]);
  // const getData = (name: string) => {
  //   fetch(`script/${name}.json`, {
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Accept: 'application/json',
  //     },
  //   })
  //     .then(function (response) {
  //       return response.json();
  //     })
  //     .then(function (myJson) {
  //       setData(myJson);
  //     });
  // };

  // 내가 공부한 자료
  const [studiedData, setStudiedData] = useState<any>({});

  function loadData() {
    setData(JSON.parse(localStorage.getItem('script') || '{}'));
    const _studiedData = JSON.parse(localStorage.getItem('answer') || '{}');
    setStudiedData(_studiedData);
    studiedMaxLine.current = +Object.keys(_studiedData).reduce((a, b) => (+a > +b ? a : b), '0');
  }

  useEffect(() => {
    loadData();
  }, []);

  const [text, setText] = useState('');
  function handleChange(text: string) {
    setText(text);
  }

  const [line, setLine] = useState<number>(0);
  const [prevData, setPrevData] = useState<any>([]);
  function handleNext() {
    const nextLine = line + 1;
    setLine(nextLine);
    setPrevData(data.slice(0, nextLine));
    if (text === '') {
      return;
    }

    const answer: { [key: number]: string } = {};
    answer[line] = text;
    const answerList = { ...studiedData, ...answer };
    setStudiedData(answerList);
    localStorage.setItem('answer', JSON.stringify(answerList));
    setText('');
  }

  function handleCopy() {
    copy(localStorage.getItem('answer') || '{}');
  }

  const scrollToBottom = () => {
    if (scrollBoxRef.current) {
      scrollBoxRef.current.scrollTop = scrollBoxRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [prevData]);

  // 공부했던 가장 마지막 라인
  const studiedMaxLine = useRef<number>(0);
  // const [studiedMaxLine, setStudiedMaxLine] = useState<number>(0);
  useEffect(() => {
    try {
      studiedMaxLine.current = +Object.keys(studiedData).reduce((a, b) => (+a > +b ? a : b),'0');
    } catch {}
  }, [studiedData]);

  const [tabId, setTabId] = React.useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabId(newValue);
  };

  const [scriptData, ] = useState<string>('');
  const [rawStudiedData, setRawStudiedData] = useState<string>('');
  const handleSave = (type: string) => {
    if (type === 'ScriptData') {
      localStorage.setItem('script', scriptData);
    } else if (type === 'StudiedData') {
      localStorage.setItem(`answer`, rawStudiedData);
    }
    loadData();
  };

  const scriptFileInput: any = React.useRef(null);
  const answerFileInput: any = React.useRef(null);

  const handleScriptButtonClick = (e: any) => {
    scriptFileInput.current?.click();
  };
  const handleAnswerButtonClick = (e: any) => {
    answerFileInput.current?.click();
  };

  const handleFileChange = (e: any, type:string) => {
    let fileReader = new FileReader();
    fileReader.onload = async () => {
      const fileData: string = fileReader.result as string;
      if(type === 'script'){
        localStorage.setItem('script', fileData);
        scriptFileInput.current.value = null;
      }else{
        localStorage.setItem('answer', fileData);
        answerFileInput.current.value = null;
      }
      loadData();
      setLine(studiedMaxLine.current);
      setPrevData(data.slice(0, studiedMaxLine.current))
    };
    fileReader.readAsText(e.target.files[0]);
  };

  const handleDownload = () => {
    // https://www.folkstalk.com/2022/07/react-js-download-file-with-code-examples.html
    const url = window.URL.createObjectURL(
      new Blob([localStorage.getItem('answer')||'']),
    );
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `answer.txt`,
    );

    // Append to html link element page
    document.body.appendChild(link);

    // Start download
    link.click();

    // Clean up and remove the link
    link.parentNode?.removeChild(link);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Tabs sx={{ m: 1 }} value={tabId} onChange={handleTabChange}>
        <Tab label="Script" sx={{ textTransform: 'none' }} />
        <Tab label="Setting" sx={{ textTransform: 'none' }} />
      </Tabs>
      <TabPanel value={tabId} index={0}>
        <Paper elevation={3} sx={{ pl: 1 }}>
          <Box
            ref={scrollBoxRef}
            style={{
              display: 'block',
              width: '100%',
              overflow: 'auto',
              height: '500px',
            }}
          >
            {prevData &&
              prevData.length > 0 &&
              prevData.map((item: any, i: number) => (
                <Typography key={i} variant="body2" gutterBottom>
                  {item.idx}: {item.en}-{item.kr} <br />
                  My answer : {studiedData[i]}
                </Typography>
              ))}
          </Box>
        </Paper>
      </TabPanel>
      <TabPanel value={tabId} index={1}>
        <Card elevation={3}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                mt: 2,
                mx: 2,
              }}
            >
              <Button onClick={handleScriptButtonClick}>스크립트 업로드</Button>
              <Button onClick={handleAnswerButtonClick}>답변 업로드</Button>
              <input type="file" ref={scriptFileInput} onChange={(e: any) => handleFileChange(e, 'script')} style={{ display: 'none' }} />
              <input type="file" ref={answerFileInput} onChange={(e: any) => handleFileChange(e, 'answer')} style={{ display: 'none' }} />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                mt: 2,
                mx: 2,
              }}
            >
              <TextField
                multiline
                fullWidth
                label="대답"
                variant="standard"
                value={rawStudiedData}
                sx={{ mr: 2 }}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setRawStudiedData(event.target.value);
                }}
              />
              <Button sx={{ flexBasis: '72px' }} onClick={(e) => handleSave('StudiedData')}>
                대답저장
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          p: 1,
          m: 1,
        }}
      >
        <TextField
          label="line"
          value={line}
          variant="standard"
          sx={{ mr: 2 }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setPrevData(data.slice(0, +event.target.value));
            setLine(+event.target.value);
          }}
        />
        <Chip avatar={<Avatar>{studiedMaxLine.current}</Avatar>} label="studied" onClick={(e) => {setPrevData(data.slice(0, studiedMaxLine.current));setLine(studiedMaxLine.current)}} />
        <Chip label="copy" onClick={(e) => handleCopy()} />
        <Chip label="download" onClick={(e) => handleDownload()} />
        <Chip label="next" onClick={(e) => handleNext()} />
      </Box>
      {data && data.length > 0 && (
        <Question idx={data[line]?.idx} en={data[line]?.en} kr={data[line]?.kr} onChange={handleChange} />
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          p: 1,
          m: 1,
        }}
      ></Box>
    </Box>
  );
}
/*
https://blog.qvil.dev/react/react-scroll-to-bottom-with-messages-effect
https://stackoverflow.com/questions/72036806/map-through-two-arrays-react
*/

export default Main;