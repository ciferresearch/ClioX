import os
import json


def test_chatbot(job_details):
    print('Starting compute job with the following input information:')
    print(json.dumps(job_details, sort_keys=True, indent=4))

    root = os.getenv('ROOT_FOLDER', '')
    output_list = [
      {
        "id": "doc1_chunk1",
        "content": "This is the introduction of the document. It explains the main concepts and objectives...",
        "metadata": {
          "source": "business_report.pdf",
          "page": 1,
          "title": "Q3 Business Report",
          "type": "pdf",
          "section": "Introduction"
        }
      },
      {
        "id": "doc1_chunk1",
        "content": "This is the introduction of the document. It explains the main concepts and objectives...",
        "metadata": {
          "source": "business_report.pdf",
          "page": 1,
          "title": "Q3 Business Report",
          "type": "pdf",
          "section": "Introduction"
        }
      }
    ]
    output_path = os.path.join(root, "data/outputs/result.json")
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

    