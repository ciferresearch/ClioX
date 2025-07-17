import os
import json


def test_chatbot(job_details):
    print('Starting compute job with the following input information:')
    print(json.dumps(job_details, sort_keys=True, indent=4))

    root = os.getenv('ROOT_FOLDER', '')
    output_list = [
      {
        "id": "doc_001",
        "content": "Web3 is the next generation of the internet, built on blockchain technology, where users have control over their data and content. Think of it like the difference between renting a house (Web2) and owning it (Web3). While Web2 platforms control your data and content, Web3 gives you the keys to your digital life—offering more privacy, transparency, and autonomy online.",
        "metadata": {
          "source": "doc1.pdf",
          "category": "protocol_overview",
          "tags": ["blockchain", "data", "privacy"]
        }
      },
      {
        "id": "doc_002",
        "content": "In Greek mythology, Clio was the Muse of history, one of nine daughters of Zeus and Mnemosyne. She is reflected as having a role in preserving and making famous historical events and is often depicted with objects like scrolls, stone tablets or a lyre symbolizing her connection to history and storytelling.",
        "metadata": {
          "source": "doc2.pdf",
          "category": "clio",
          "tags": ["clio"]
        }
      }
    ]
    output_path = os.path.join(root, "data/outputs/result")
    with open(output_path, "w", encoding='utf-8') as f:
        json.dump(output_list, f, ensure_ascii=False, indent=2)


def get_job_details():
    root = os.getenv('ROOT_FOLDER', '')
    """Reads in metadata information about assets used by the algo"""
    job = dict()
    job['dids'] = json.loads(os.getenv('DIDS', None))
    job['metadata'] = dict()
    job['files'] = dict()
    job['algo'] = dict()
    job['secret'] = os.getenv('secret', None)
    algo_did = os.getenv('TRANSFORMATION_DID', None)
    if job['dids'] is not None:
        for did in job['dids']:
            job['files'][did] = list()
            # Just one file for DID with name "0"
            job['files'][did].append(root + '/data/inputs/' + did + '/0')
    if algo_did is not None:
        job['algo']['did'] = algo_did
        job['algo']['ddo_path'] = root + '/data/ddos/' + algo_did
    return job


if __name__ == "__main__":
    job_details = get_job_details()
    test_chatbot(job_details)

    