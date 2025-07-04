def mock_personality_scores(answers: list[int]) -> dict:
    return {
        "openness": sum(answers[:5]) // 5,
        "conscientiousness": sum(answers[5:10]) // 5,
        "extraversion": sum(answers[10:]) // 5
    }
