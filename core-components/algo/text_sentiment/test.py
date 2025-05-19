import os
from unittest import TestCase, mock
import sys

# sys.path.append(os.path.dirname(os.path.realpath(__file__)) + '/../')
from text_analysis import text_analysis, get_job_details

class Test(TestCase):

    @mock.patch.dict(os.environ, {"DIDS": " [ \"eb60f87363a36a5ae5cb8373524a8fd976b0cc5f8c40a706c615b857ae0e2974\" ]"})
    @mock.patch.dict(os.environ, {"TRANSFORMATION_DID": "6EDaE15f7314dC306BB6C382517D374356E6B9De"})
    @mock.patch.dict(os.environ, {"secret": "MOCK-SECRET"})
    @mock.patch.dict(os.environ, {"ROOT_FOLDER": os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), '../..'))})
    def test_iris_algo(self):
        print('Testing is running')

        text_analysis(get_job_details())
        # root = os.getenv('ROOT_FOLDER', '')
        # with open(root + '/data/outputs/result.json') as f:
        #     self.assertIsNotNone(f)



"""
step 1:  nevigate to the root folder PETS-MARKETPLACE-ADV
step 2: run code: python -m unittest algo.test.test_iris_algo
"""