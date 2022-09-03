import { useState, useEffect } from "react";
import Loader from "../../components/Loader";
import io from "socket.io-client";
import { useRecoilState } from "recoil";
import { userState } from "../../utils/userAtom";
import { useRouter } from "next/router";
import WaitingRoom from "./waiting";
import Roast from "./roast";
import Voting from "./voting";
import Score from "./score";
import Results from "./result";
let socket = null;

const GameContent = () => {
  const router = useRouter();

  const [user, setUser] = useRecoilState(userState);
  //   const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [players, setPlayers] = useState([]);
  const [details, setDetails] = useState({});
  const [currentRound, setCurrentRound] = useState(0);
  const [roundDetails, setRoundDetails] = useState({});
  const [voteCandidates, setVoteCandidates] = useState([]);
  const [scores, setScores] = useState([]);
  const [results, setResults] = useState([]);
  const [showVoting, setShowVoting] = useState(false);
  const [showScores, setShowScores] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (user && router.query.code) {
      console.log(router.query.code);
      socket = io(`${process.env.NEXT_PUBLIC_API_URL}/game`, {
        withCredentials: true,
      });
      socket.emit("join-game", router.query.code);

      socket.on("game-details", (payload) => {
        if (!payload.success) {
          setLoading(false);
          setErrorMsg(payload.message);
        } else {
          setLoading(false);
          setErrorMsg(null);
          setPlayers(payload.game.players);
          setDetails(payload.game);
          console.log(payload);
        }
      });

      socket.on("players", (players) => {
        console.log(players);
        setPlayers(players);
      });

      socket.on("next-round", (data) => {
        console.log("next round");
        setCurrentRound(data.round);
        setRoundDetails(data.details);
        setVoteCandidates([]);
        setShowVoting(false);
        setShowScores(false);
        setShowResult(false);
      });

      socket.on("voting", (data) => {
        setShowVoting(true);
        setShowScores(false);
        setShowResult(false);
        setVoteCandidates(data);
      });

      socket.on("score", (data) => {
        setShowVoting(false);
        setShowScores(true);
        setShowResult(false);
        setScores(data);
      });

      socket.on("results", (data) => {
        setResults(data);
        setShowResult(true);
        setShowScores(false);
        setShowVoting(false);
      });
    }

    window.addEventListener("beforeunload", (e) => {
      //e.preventDefault()
      socket.emit("leave-game", router.query.code);
      socket?.disconnect();
    });

    return () => {
      if (router.query.code) {
        socket.emit("leave-game", router.query.code);
        socket.disconnect();
      }
    };
  }, [router.query.code]);

  useEffect(() => {
    console.log(players);
  }, [players]);
  return (
    <>
      {loading || !socket ? (
        <div
          style={{
            display: "flex",
            height: "80vh",
            width: "100%",
          }}
        >
          <Loader center />
        </div>
      ) : (
        <div style={{ width: "100%" }}>
          {errorMsg ? (
            <div>{errorMsg}</div>
          ) : currentRound != 0 ? (
            !showVoting && !showScores && !showResult ? (
              <Roast
                details={roundDetails}
                round={currentRound}
                submitRoast={(roast) =>
                  socket.emit("submit", {
                    code: router.query.code,
                    roast: roast,
                  })
                }
              />
            ) : showVoting ? (
              <Voting
                voteCandidates={voteCandidates}
                submitVote={(vote) => {
                  socket.emit("vote", {
                    code: router.query.code,
                    vote: vote,
                  });
                }}
              />
            ) : showScores ? (
              <Score
                scores={scores}
                owner={details.owner}
                nextRound={() => {
                  socket.emit("next-round", router.query.code);
                }}
                currentRound={details.currentRound}
              />
            ) : showResult ? (
              <Results owner={details.owner} results={results} />
            ) : (
              <div></div>
            )
          ) : (
            <WaitingRoom
              details={details}
              onStart={() => {
                socket.emit("start", router.query.code);
              }}
              players={players}
            />
          )}
        </div>
      )}
    </>
  );
};

export default GameContent;
