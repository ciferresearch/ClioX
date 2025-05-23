# =========
# Append the path of the algorithm to the sys.path
#
# This is needed because THIS .py file is downloaded from the given URL, whilst the rest of the implementation is not.
# The rest of the implementation, can (and should) be added in two ways:
# 1. ADD/COPY the implementation source code in the Dockerfile provided later to the dataspace.
# 2. Mounted as a volume for quick development iterations.
#
# This step is not needed if this file contains the whole implementation of your algorithm, in which case
# you could use the `python-monolith` version.
import sys

sys.path.append("/algorithm/src")
# ======

import logging
from dataclasses import asdict
from pathlib import Path

from oceanprotocol_job_details.config import config
from oceanprotocol_job_details.job_details import OceanProtocolJobDetails
from oceanprotocol_job_details.ocean import JobDetails
from orjson import dumps

from implementation.algorithm import Algorithm

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def main():
    # Load the current job details from the environment variables
    job_details: JobDetails = OceanProtocolJobDetails().load()

    logger.info("Starting compute job with the following input information:")
    logger.info(dumps({k: str(v) for k, v in asdict(job_details).items()}))

    algorithm = Algorithm(job_details)

    try:
        algorithm.run()
    except Exception as e:
        logger.exception(f"An error occurred while running the algorithm: {e}")

    try:
        algorithm.save_result(Path(config.path_outputs))
    except Exception as e:
        logger.exception(f"An error occurred while saving the results: {e}")


if __name__ == "__main__":
    main()
