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
        logger.info("Starting Cameroon Gazette RAG text chunking process")
        
        # Initialize results dictionary
        self.results = {
            "text_chunks": []
        }

        self._validate_input()

        input_files = self._job_details.files.files[0].input_files
        filename = str(input_files[0])
        
        logger.info(f"Processing input file: {filename}")
    
        # Read JSON file
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                data = json.load(f)
            logger.info("Successfully loaded JSON data from input file")
        except Exception as e:
            logger.error(f"Failed to load JSON data: {e}")
            return self

        # Log basic document information
        gazette_info = {
            "gazette": data.get("Official_Gazette", "Unknown"),
            "date": data.get("Date", "Unknown"),
            "page": data.get("Page", "Unknown")
        }
        logger.info(f"Processing gazette: {gazette_info['gazette']}, Date: {gazette_info['date']}, Page: {gazette_info['page']}")

        # Initialize counters
        total_chunks = 0
        decree_count = 0
        order_count = 0
        text_chunks = []

        # Process Decrees
        decrees = data.get("Decrees", [])
        logger.info(f"Found {len(decrees)} decree(s) to process")

        for i, decree in enumerate(decrees):
            decree_count += 1
            decree_no = decree.get("Decree_No", f"Unknown_{i}")
            appointee_name = decree.get("Appointee", {}).get("Name", "Unknown")
            position = decree.get("Appointee", {}).get("Position", "Unknown")
            article_count = len(decree.get("Articles", []))
            
            logger.info(f"Processing Decree {decree_no}: Appointee '{appointee_name}' to position '{position}' with {article_count} article(s)")
            
            try:
                # Create general chunk
                general_chunk = {
                    "id": f"decree_{decree_no}_general",
                    "type": "general_info",
                    "content": self.create_general_content(decree, "decree"),
                    "structured_data": {
                        "Decree_No": decree_no,
                        "Date": decree.get("Date", "Unknown"),
                        "Title_FR": decree.get("Title_FR", ""),
                        "Title_EN": decree.get("Title_EN", ""),
                        "Appointee": decree.get("Appointee", {})
                    },
                    "metadata": {
                        "document_type": "decree",
                        "document_number": decree_no,
                        "appointee_name": appointee_name,
                        "position": position,
                        "effective_date": decree.get("Appointee", {}).get("Effective_Date", "Unknown"),
                        "gazette_date": data.get("Date", "Unknown"),
                        "page": data.get("Page", "Unknown"),
                        "chunk_type": "general"
                    }
                }
                
                text_chunks.append(general_chunk)
                total_chunks += 1
                logger.debug(f"Created general chunk for decree {decree_no}")
            
                # Process articles
                for j, article in enumerate(decree.get('Articles', [])):
                    article_no = article.get("Article_No", j+1)
                    
                    article_chunk = {
                        "id": f"decree_{decree_no}_article_{article_no}",
                        "type": "article_detail",
                        "content": self.create_article_content(article, decree),
                        "structured_data": {
                            "Article_No": article_no,
                            "Content_FR": article.get("Content_FR", ""),
                            "Content_EN": article.get("Content_EN", ""),
                            "Parent_Decree": decree_no
                        },
                        "metadata": {
                            "document_type": "decree",
                            "document_number": decree_no,
                            "article_number": article_no,
                            "appointee_name": appointee_name,
                            "position": position,
                            "gazette_date": data.get("Date", "Unknown"),
                            "page": data.get("Page", "Unknown"),
                            "chunk_type": "article",
                            "parent_chunk_id": f"decree_{decree_no}_general"
                        }
                    }

                    text_chunks.append(article_chunk)
                    total_chunks += 1
                    logger.debug(f"Created article chunk {article_no} for decree {decree_no}")
                
                logger.info(f"Successfully processed decree {decree_no}: created {1 + article_count} chunks")
                
            except Exception as e:
                logger.error(f"Error processing decree {decree_no}: {e}")
                continue

        # Process Orders
        orders = data.get("Orders", [])
        logger.info(f"Found {len(orders)} order(s) to process")

        for i, order in enumerate(orders):
            order_count += 1
            order_no = order.get("Order_No", f"Unknown_{i}")
            appointee_name = order.get("Appointee", {}).get("Name", "Unknown")
            new_role = order.get("Appointee", {}).get("New_Role_EN", "Unknown")
            previous_role = order.get("Appointee", {}).get("Previous_Role", "Not specified")
            article_count = len(order.get("Articles", []))
            
            logger.info(f"Processing Order {order_no}: Appointee '{appointee_name}' from '{previous_role}' to '{new_role}' with {article_count} article(s)")
            
            try:
                # Create general chunk
                general_chunk = {
                    "id": f"order_{order_no}_general",
                    "type": "general_info",
                    "content": self.create_general_content(order, "order"),
                    "structured_data": {
                        "Order_No": order_no,
                        "Date": order.get("Date", "Unknown"),
                        "Title_FR": order.get("Title_FR", ""),
                        "Title_EN": order.get("Title_EN", ""),
                        "Appointee": order.get("Appointee", {})
                    },
                    "metadata": {
                        "document_type": "order",
                        "document_number": order_no,
                        "appointee_name": appointee_name,
                        "gazette_date": data.get("Date", "Unknown"),
                        "page": data.get("Page", "Unknown"),
                        "chunk_type": "general"
                    }
                }
                
                text_chunks.append(general_chunk)
                total_chunks += 1
                logger.debug(f"Created general chunk for order {order_no}")
                
                # Process articles
                for j, article in enumerate(order.get('Articles', [])):
                    article_no = article.get("Article_No", j+1)
                    
                    article_chunk = {
                        "id": f"order_{order_no}_article_{article_no}",
                        "type": "article_detail",
                        "content": self.create_article_content(article, order),
                        "structured_data": {
                            "Article_No": article_no,
                            "Content_FR": article.get("Content_FR", ""),
                            "Content_EN": article.get("Content_EN", ""),
                            "Parent_Order": order_no
                        },
                        "metadata": {
                            "document_type": "order",
                            "document_number": order_no,
                            "article_number": article_no,
                            "appointee_name": appointee_name,
                            "gazette_date": data.get("Date", "Unknown"),
                            "page": data.get("Page", "Unknown"),
                            "chunk_type": "article",
                            "parent_chunk_id": f"order_{order_no}_general"
                        }
                    }
                    
                    text_chunks.append(article_chunk)
                    total_chunks += 1
                    logger.debug(f"Created article chunk {article_no} for order {order_no}")
                
                logger.info(f"Successfully processed order {order_no}: created {1 + article_count} chunks")
                
            except Exception as e:
                logger.error(f"Error processing order {order_no}: {e}")
                continue

        # Store the chunks in results
        self.results['text_chunks'] = text_chunks
        
        # Log final summary
        logger.info("=== PROCESSING SUMMARY ===")
        logger.info(f"Total documents processed: {decree_count + order_count}")
        logger.info(f"  - Decrees: {decree_count}")
        logger.info(f"  - Orders: {order_count}")
        logger.info(f"Total chunks created: {total_chunks}")
        logger.info(f"Results structure: {type(self.results)}")
        logger.info(f"Text chunks type: {type(self.results.get('text_chunks', 'Missing'))}")
        
        if 'text_chunks' in self.results:
            chunks = self.results['text_chunks']
            general_chunks = len([c for c in chunks if c.get('metadata', {}).get('chunk_type') == 'general'])
            article_chunks = len([c for c in chunks if c.get('metadata', {}).get('chunk_type') == 'article'])
            logger.info(f"  - General info chunks: {general_chunks}")
            logger.info(f"  - Article detail chunks: {article_chunks}")
            
            # Validate chunk structure
            if chunks:
                first_chunk = chunks[0]
                logger.info(f"Sample chunk structure - ID: {first_chunk.get('id', 'Missing')}, Type: {first_chunk.get('type', 'Missing')}")
            else:
                logger.warning("No chunks were created despite processing documents!")
        else:
            logger.error("text_chunks key missing from results!")
        
        logger.info("=== END SUMMARY ===")
        
        return self



    def create_general_content(self, document, doc_type):
        """Create searchable text content for general information chunk"""
        logger.debug(f"Creating general content for {doc_type} document")
        
        appointee = document.get("Appointee", {})
        doc_number = document.get('Decree_No') or document.get('Order_No', 'Unknown')
        
        content_parts = [
            f"{doc_type.title()} {doc_number}",
            f"Date: {document.get('Date', 'Unknown')}",
            "",
            f"Title (French): {document.get('Title_FR', 'N/A')}",
            f"Title (English): {document.get('Title_EN', 'N/A')}",
            "",
            "Appointee Information:",
            f"Name: {appointee.get('Name', 'Unknown')}",
            f"Previous Title: {appointee.get('Title', 'N/A')}",
            f"New Position: {appointee.get('Position', appointee.get('New_Role_EN', 'N/A'))}",
            f"Effective Date: {appointee.get('Effective_Date', document.get('Date', 'Unknown'))}"
        ]
        
        # Add order-specific information
        if 'Previous_Role' in appointee:
            content_parts.append(f"Previous Role: {appointee['Previous_Role']}")
        if 'Replacement' in appointee:
            content_parts.append(f"Replaces: {appointee['Replacement']}")
        
        content = "\n".join(content_parts)
        logger.debug(f"Generated general content with {len(content)} characters")
        
        return content

    def create_article_content(self, article, parent_document):
        """Create searchable text content for article chunk"""
        doc_num = parent_document.get('Decree_No') or parent_document.get('Order_No', 'Unknown')
        article_no = article.get('Article_No', 'Unknown')
        
        logger.debug(f"Creating article content for article {article_no} of document {doc_num}")
        
        content_parts = [
            f"Article {article_no} of {doc_num}",
            "",
            "French Text:",
            article.get('Content_FR', 'N/A'),
            "",
            "English Text:",
            article.get('Content_EN', 'N/A'),
            "",
            f"Context: This article is part of the appointment of {parent_document.get('Appointee', {}).get('Name', 'Unknown')} to the position of {parent_document.get('Appointee', {}).get('Position', parent_document.get('Appointee', {}).get('New_Role_EN', 'N/A'))}."
        ]
        
        content = "\n".join(content_parts)
        logger.debug(f"Generated article content with {len(content)} characters")
        
        return content


        

    
    def save_result(self, path: Path) -> None:
        text_chunks_path = path / "text_chunks.json"

        with open(text_chunks_path, "w", encoding="utf-8") as f:
            try:
                json.dump(self.results['text_chunks'], f, indent=2)
                logger.info(f"Saved text chunks data to {text_chunks_path}")
            except Exception as e:
                logger.exception(f"Error saving data: {e}")

