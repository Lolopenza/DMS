from ai.rag.pipeline import get_rag_pipeline


def test_rag_retrieve_returns_relevant_hits_for_matrix_query():
    pipeline = get_rag_pipeline()
    hits = pipeline.retrieve('how matrix multiplication works', top_k=2)

    assert isinstance(hits, list)
    assert len(hits) >= 1
    assert any(hit['subject'] == 'linear-algebra' for hit in hits)


def test_rag_augment_messages_adds_system_context():
    pipeline = get_rag_pipeline()
    messages = [
        {'role': 'user', 'content': 'Explain vector norm with an example'},
    ]

    augmented = pipeline.augment_messages(messages)
    assert len(augmented) >= 2
    assert augmented[0]['role'] == 'system'
    assert 'retrieved educational context' in augmented[0]['content'].lower()


def test_rag_retrieve_respects_subject_scope():
    pipeline = get_rag_pipeline()

    hits = pipeline.retrieve(
        'matrix multiplication basics',
        top_k=3,
        subject='discrete-math',
    )

    assert hits == []


def test_rag_retrieve_respects_module_scope():
    pipeline = get_rag_pipeline()

    hits = pipeline.retrieve(
        'explain permutations and combinations',
        top_k=3,
        subject='discrete-math',
        module='combinatorics',
    )

    assert len(hits) >= 1
    assert all(hit['subject'] == 'discrete-math' for hit in hits)
    assert any('combinatorics' in ' '.join(hit.get('tags', [])).lower() for hit in hits)


def test_rag_augment_messages_uses_scope_to_avoid_irrelevant_context():
    pipeline = get_rag_pipeline()
    messages = [
        {'role': 'user', 'content': 'How matrix multiplication works?'},
    ]

    augmented = pipeline.augment_messages(messages, subject='discrete-math')

    # No discrete-math matrix docs in baseline index, so augmentation should be skipped.
    assert augmented == messages
