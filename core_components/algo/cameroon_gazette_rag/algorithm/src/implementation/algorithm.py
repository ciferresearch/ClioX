from logging import getLogger
from pathlib import Path
from typing import Any, Optional, TypeVar
from oceanprotocol_job_details.ocean import JobDetails

import torch
import json
import pandas as pd

T = TypeVar("T")
logger = getLogger(__name__)


class Algorithm:

    def __init__(self, job_details: JobDetails):
        self._job_details = job_details
        self.results = {}
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {self.device}")

    def _validate_input(self) -> None:
        if not self._job_details.files:
            logger.warning("No files found")
            raise ValueError("No files found")


    def run(self) -> "Algorithm":
        # Initialize results dictionary
        self.results = {
            "text_chunks": []
        }

        self._validate_input()

        input_files = self._job_details.files.files[0].input_files
        filename = str(input_files[0])
    
        # Read JSON file
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Extract dates and content from Decrees
        text_chunks = []

        for decree in data.get("Decrees", []):
            general_chunk = {
                "id": f"decree_{decree['Decree_No']}_general",
                "type": "general_info",
                "content": self.create_general_content(decree, "decree"),
                "structured_data": {
                    "Decree_No": decree["Decree_No"],
                    "Date": decree["Date"],
                    "Title_FR": decree["Title_FR"],
                    "Title_EN": decree["Title_EN"],
                    "Appointee": decree["Appointee"]
                },
                "metadata": {
                    "document_type": "decree",
                    "document_number": decree["Decree_No"],
                    "appointee_name": decree["Appointee"]["Name"],
                    "position": decree["Appointee"]["Position"],
                    "effective_date": decree["Appointee"]["Effective_Date"],
                    "gazette_date": data["Date"],
                    "page": data["Page"],
                    "chunk_type": "general"
                }
            }
            
            text_chunks.append(general_chunk)
            
            for article in decree.get('Articles',[]):
                article_chunk = {
                    "id": f"decree_{decree['Decree_No']}_article_{article['Article_No']}",
                    "type": "article_detail",
                    "content": self.create_article_content(article, decree),
                    "structured_data": {
                        "Article_No": article["Article_No"],
                        "Content_FR": article["Content_FR"],
                        "Content_EN": article["Content_EN"],
                        "Parent_Decree": decree["Decree_No"]
                    },
                    "metadata": {
                        "document_type": "decree",
                        "document_number": decree["Decree_No"],
                        "article_number": article["Article_No"],
                        "appointee_name": decree["Appointee"]["Name"],
                        "position": decree["Appointee"]["Position"],
                        "gazette_date": data["Date"],
                        "page": data["Page"],
                        "chunk_type": "article",
                        "parent_chunk_id": f"decree_{decree['Decree_No']}_general"
                    }
                }

                text_chunks.append(article_chunk)

        for order in data.get("Orders", []):
            general_chunk = {
                "id": f"order_{order['Order_No']}_general",
                "type": "general_info",
                "content": self.create_general_content(order, "order"),
                "structured_data": {
                    "Order_No": order["Order_No"],
                    "Date": order["Date"],
                    "Title_FR": order["Title_FR"],
                    "Title_EN": order["Title_EN"],
                    "Appointee": order["Appointee"]
                },
                "metadata": {
                    "document_type": "order",
                    "document_number": order["Order_No"],
                    "appointee_name": order["Appointee"]["Name"],
                    "gazette_date": data["Date"],
                    "page": data["Page"],
                    "chunk_type": "general"
                }
            }
            text_chunks.append(general_chunk)
            
            for article in order.get('Articles', []):
                article_chunk = {
                    "id": f"order_{order['Order_No']}_article_{article['Article_No']}",
                    "type": "article_detail",
                    "content": self.create_article_content(article, order),
                    "structured_data": {
                        "Article_No": article["Article_No"],
                        "Content_FR": article["Content_FR"],
                        "Content_EN": article["Content_EN"],
                        "Parent_Order": order["Order_No"]
                    },
                    "metadata": {
                        "document_type": "order",
                        "document_number": order["Order_No"],
                        "article_number": article["Article_No"],
                        "appointee_name": order["Appointee"]["Name"],
                        "gazette_date": data["Date"],
                        "page": data["Page"],
                        "chunk_type": "article",
                        "parent_chunk_id": f"order_{order['Order_No']}_general"
                    }
                }
                text_chunks.append(article_chunk)

        # Store the chunks in results
        self.results['text_chunks'] = text_chunks
        
        return self



    def create_general_content(self, document, doc_type):
        """Create searchable text content for general information chunk"""
        appointee = document["Appointee"]
    
        content = f"""
            {doc_type.title()} {document.get('Decree_No') or document.get('Order_No')}
            Date: {document['Date']}

            Title (French): {document['Title_FR']}
            Title (English): {document['Title_EN']}

            Appointee Information:
            Name: {appointee['Name']}
            Previous Title: {appointee.get('Title', 'N/A')}
            New Position: {appointee.get('Position', appointee.get('New_Role_EN', 'N/A'))}
            Effective Date: {appointee.get('Effective_Date', document['Date'])}
        """
    
        # Add order-specific information
        if 'Previous_Role' in appointee:
            content += f"Previous Role: {appointee['Previous_Role']}\n"
        if 'Replacement' in appointee:
            content += f"Replaces: {appointee['Replacement']}\n"
        
        return content.strip()

    def create_article_content(self,article, parent_document):
        """Create searchable text content for article chunk"""
        doc_num = parent_document.get('Decree_No') or parent_document.get('Order_No')
        
        content = f"""
            Article {article['Article_No']} of {doc_num}

            French Text:
            {article['Content_FR']}

            English Text:
            {article['Content_EN']}

            Context: This article is part of the appointment of {parent_document['Appointee']['Name']} to the position of {parent_document['Appointee'].get('Position', parent_document['Appointee'].get('New_Role_EN', 'N/A'))}.
        """
                
        return content.strip()


        

    
    def save_result(self, path: Path) -> None:
        text_chunks_path = path / "text_chunks.json"

        with open(text_chunks_path, "w", encoding="utf-8") as f:
            try:
                json.dump(self.results['text_chunks'], f, indent=2)
                logger.info(f"Saved text chunks data to {text_chunks_path}")
            except Exception as e:
                logger.exception(f"Error saving data: {e}")

