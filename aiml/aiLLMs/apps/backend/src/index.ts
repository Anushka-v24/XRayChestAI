import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { ChatGroq } from "@langchain/groq";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../frontend/.env") });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
 process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const groqApiKey = process.env.GROQ_KEY || process.env.GROQ_API_KEY;
const huggingFaceApiKey =
 process.env.HUGGINGFACEHUB_API_KEY || process.env.HUGGINGFACE_API_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
 throw new Error(
   "Missing Supabase config. Set SUPABASE_URL/SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY."
 );
}

const embeddings = new HuggingFaceInferenceEmbeddings({
 apiKey: huggingFaceApiKey,
});
const supabaseClient = createClient(
 supabaseUrl,
 supabaseAnonKey
);
const currentUserId = "84f";
const demoPdfPath = path.resolve(__dirname, "Stoner.pdf");
// const vectorStore = new SupabaseVectorStore(embeddings, {
//   client: supabaseClient,
//   tableName: "documents",
//   queryName: "match_documents",
// });


const llm = new ChatGroq({
 model: "llama-3.3-70b-versatile",
 temperature: 0,
 maxTokens: undefined,
 maxRetries: 2,
 apiKey: groqApiKey,
 // other params...
});
const USER_ID = "df1f93ae-6827-4c42-b8a3-9a0e2e80784f";
const NON_EXISTENT_USER_ID = "non_existent_user";
async function debugDatabase() {
 try {
   // Check what's in the database
   const { data: allDocs, error } = await supabaseClient
     .from('documents')
     .select('id, metadata')
     .limit(10);
  
   if (error) {
     console.error('Database error:', error);
     return;
   }
  
   console.log('All documents in database:', allDocs);
  
   // Check specific user documents
   const { data: userDocs, error: userError } = await supabaseClient
     .from('documents')
     .select('id, metadata')
     .eq('metadata->>user_id', USER_ID);
  
   if (userError) {
     console.error('User query error:', userError);
     return;
   }
  
   console.log(`Documents for user ${USER_ID}:`, userDocs);
  
   // Test the match_documents function directly
   const { data: matchResult, error: matchError } = await supabaseClient
     .rpc('match_documents', {
       query_embedding: new Array(768).fill(0), // dummy embedding
       match_count: 10,
       filter: { user_id: USER_ID }
     });
  
   if (matchError) {
     console.error('Match function error:', matchError);
     return;
   }
  
   console.log('Match function result:', matchResult);
  
 } catch (error) {
   console.error('Debug error:', error);
 }
}


 async function loading() {
 try {
   const loader = new PDFLoader(demoPdfPath);
   const docs = await loader.load();


   const textSplitter = new RecursiveCharacterTextSplitter({
     chunkSize: 1000,
     chunkOverlap: 200,
   });


   const splitDocs = await textSplitter.splitDocuments(docs);
  
   // Add user_id to metadata consistently
   const enrichedDocs = splitDocs.map((doc) => ({
     ...doc,
     metadata: {
       ...doc.metadata,
       user_id: USER_ID,
       source: "Stoner.pdf",
       uploaded_at: new Date().toISOString()
     },
   }));


   console.log('Sample enriched doc metadata:', enrichedDocs[0].metadata);


   const vectorStore1 = await SupabaseVectorStore.fromDocuments(
     enrichedDocs,
     embeddings,
     {
       client: supabaseClient,
       tableName: "documents",
       queryName: "match_documents",
     }
   );


   console.log('Documents uploaded successfully');
  
   // Test immediate retrieval
   const testResults = await vectorStore1.similaritySearch(
     "test query",
     5,
     { user_id: USER_ID }
   );
  
   console.log('Test search results:', testResults.length);
   console.log('Sample result metadata:', testResults[0]?.metadata);


   return vectorStore1;
 } catch (error) {
   console.error("Error in loading():", error);
   throw error;
 }
}


async function queryUserDocs2() {
 try {
   // vector store instance for querying
   const vectorStoreQuery = new SupabaseVectorStore(embeddings, {
     client: supabaseClient,
     tableName: "documents",
     queryName: "match_documents",
   });


   // QA prompt
   const questionAnsweringPrompt = ChatPromptTemplate.fromMessages([
     ["system", "You are a helpful assistant. Use ONLY the following context to answer the question. "
   + "If the context is empty or unrelated, say 'I don't have enough information to answer this question.'\n\n{context}"],
     ["human", "{input}"],
   ]);


   const combineDocsChain = await createStuffDocumentsChain({
     llm,
     prompt: questionAnsweringPrompt,
   });


   const testQuery = "What is the significance of Stoner's relationship with Katherine Driscoll? Does it redeem any part of his life?";


   // Test 1: Existing user ID
   console.log('\n=== Test 1: Existing User ID ===');
   const existingUserRetriever = vectorStoreQuery.asRetriever({
     filter: { user_id: USER_ID },
     k: 5,
   });


   // Check raw documents first
   const existingUserDocs = await existingUserRetriever.invoke("Katherine Driscoll");
   console.log(`Found ${existingUserDocs.length} documents for existing user ${USER_ID}`);
   if (existingUserDocs.length > 0) {
     console.log('Sample metadata:', existingUserDocs[0]?.metadata);
   }


   // Test full RAG pipeline
   const existingUserChain = await createRetrievalChain({
     retriever: existingUserRetriever,
     combineDocsChain,
   });


   const existingUserResponse = await existingUserChain.invoke({
     input: testQuery,
   });
   console.log('Existing user LLM response:', existingUserResponse.answer);
   console.log('Context used:', existingUserResponse.context?.length || 0, 'documents');


   // Test 2: Non-existent user ID
   console.log('\n=== Test 2: Non-existent User ID ===');
   const nonExistentUserRetriever = vectorStoreQuery.asRetriever({
     filter: { user_id: NON_EXISTENT_USER_ID },
     k: 5,
   });


   // Check raw documents first
   const nonExistentUserDocs = await nonExistentUserRetriever.invoke("Katherine Driscoll");
   console.log(`Found ${nonExistentUserDocs.length} documents for non-existent user ${NON_EXISTENT_USER_ID}`);
   if (nonExistentUserDocs.length > 0) {
     console.log('ERROR: Found documents for non-existent user! Filter is not working.');
     console.log('Sample metadata:', nonExistentUserDocs[0]?.metadata);
   }


   // Test full RAG pipeline
   const nonExistentUserChain = await createRetrievalChain({
     retriever: nonExistentUserRetriever,
     combineDocsChain,
   });


   const nonExistentUserResponse = await nonExistentUserChain.invoke({
     input: testQuery,
   });
   console.log('Non-existent user LLM response:', nonExistentUserResponse.answer);
   console.log('Context used:', nonExistentUserResponse.context?.length || 0, 'documents');


   // Test 3: No filter
   console.log('\n=== Test 3: No Filter ===');
   const noFilterRetriever = vectorStoreQuery.asRetriever({
     k: 5,
   });


   const allDocs = await noFilterRetriever.invoke("Katherine Driscoll");
   console.log(`Found ${allDocs.length} documents without filter`);


   const noFilterChain = await createRetrievalChain({
     retriever: noFilterRetriever,
     combineDocsChain,
   });


   const noFilterResponse = await noFilterChain.invoke({
     input: testQuery,
   });
   console.log('No filter LLM response:', noFilterResponse.answer);
   console.log('Context used:', noFilterResponse.context?.length || 0, 'documents');


   // Analysis
   console.log('\n=== Filter Analysis ===');
   if (nonExistentUserDocs.length === 0 && nonExistentUserResponse.answer.toLowerCase().includes('don\'t have')) {
     console.log('  Filter is working correctly!');
     console.log('   - No documents found for non-existent user');
     console.log('   - LLM correctly responded with "no information" message');
   } else if (nonExistentUserDocs.length > 0) {
     console.log(' ERROR: Filter is NOT working!');
     console.log('   - Found documents for non-existent user');
     console.log('   - This means the filter is not being applied properly');
   } else if (nonExistentUserResponse.answer.toLowerCase().includes('stoner') ||
              nonExistentUserResponse.answer.toLowerCase().includes('katherine')) {
     console.log('  WARNING: Filter might not be working!');
     console.log('   - No documents found, but LLM gave a specific answer');
     console.log('   - This could indicate the filter is being bypassed somewhere');
   }


   return {
     existingUserDocs,
     nonExistentUserDocs,
     allDocs,
     existingUserResponse,
     nonExistentUserResponse,
     noFilterResponse
   };
 } catch (error) {
   console.error("Error in queryUserDocs():", error);
   throw error;
 }
}




















//earlier-without chain
async function queryUserDocs1() {
 try {
   // Create vector store instance for querying
   const vectorStoreQuery = new SupabaseVectorStore(embeddings, {
     client: supabaseClient,
     tableName: "documents",
     queryName: "match_documents",
   });


   // Test with existing user ID
   console.log('\n=== Testing with existing user ID ===');
   const existingUserRetriever = vectorStoreQuery.asRetriever({
     filter: { user_id: USER_ID },
     k: 5,
   });


   const existingUserDocs = await existingUserRetriever.getRelevantDocuments("Katherine Driscoll");
   console.log(`Found ${existingUserDocs.length} documents for existing user ${USER_ID}`);
   console.log('Sample metadata:', existingUserDocs[0]?.metadata);


   // Test with non-existent user ID
   console.log('\n=== Testing with non-existent user ID ===');
   const nonExistentUserRetriever = vectorStoreQuery.asRetriever({
     filter: { user_id: NON_EXISTENT_USER_ID },
     k: 5,
   });


   const nonExistentUserDocs = await nonExistentUserRetriever.getRelevantDocuments("Katherine Driscoll");
   console.log(`Found ${nonExistentUserDocs.length} documents for non-existent user ${NON_EXISTENT_USER_ID}`);
  
   if (nonExistentUserDocs.length > 0) {
     console.log('ERROR: Found documents for non-existent user! Filter is not working.');
     console.log('Sample metadata:', nonExistentUserDocs[0]?.metadata);
   } else {
     console.log('SUCCESS: No documents found for non-existent user. Filter is working correctly.');
   }


   // Test without filter
   console.log('\n=== Testing without filter ===');
   const noFilterRetriever = vectorStoreQuery.asRetriever({
     k: 5,
   });


   const allDocs = await noFilterRetriever.getRelevantDocuments("Katherine Driscoll");
   console.log(`Found ${allDocs.length} documents without filter`);


   return {
     existingUserDocs,
     nonExistentUserDocs,
     allDocs
   };
 } catch (error) {
   console.error("Error in queryUserDocs():", error);
   throw error;
 }
}




async function main() {
 try {
   if (process.env.RUN_BACKEND_DEMO !== "true") {
     console.log("Backend demo skipped. Set RUN_BACKEND_DEMO=true to run PDF indexing/debug flow.");
     return;
   }

   if (!fs.existsSync(demoPdfPath)) {
     throw new Error(`Demo PDF not found at ${demoPdfPath}`);
   }

   console.log('=== Debugging Database ===');
   await debugDatabase();
  
   console.log('\n=== Loading and indexing document ===');
   await loading();
  
   console.log('\n=== Querying user documents ===');
   await queryUserDocs2();
 } catch (error) {
   console.error("Main execution error:", error);
 }
}








main();












////fefww//////////


 async function queryUserDocs() {


 const vectorStoreQuery = new SupabaseVectorStore(embeddings, {
   client: supabaseClient,
   tableName: "documents",
   queryName: "match_documents",
 });
   const retriever = vectorStoreQuery.asRetriever({
     filter: { user_id: "787hb" },
   });
 console.log("VectorStore type:", vectorStoreQuery.constructor.name);


   const questionAnsweringPrompt = ChatPromptTemplate.fromMessages([
     ["system", "Use the following pieces of context to answer the question.\n\n{context}"],
     ["human", "{input}"],
   ]);


   const combineDocsChain = await createStuffDocumentsChain({
     llm,
     prompt: questionAnsweringPrompt,
   });


   const chain = await createRetrievalChain({
     retriever,
     combineDocsChain,
   });


   const response = await chain.invoke({   input:"What is the significance of Stoner’s relationship with Katherine Driscoll? Does it redeem any part of his life?",
   });
   console.log(response.answer);
 }






 // queryUserDocs();




// console.log(splitDocs[0]);
// const aiMsg = await llm.invoke([
//   {
//     role: "system",
//     content:
//       "You are a helpful assistant that translates English to French. Translate the user sentence.",
//   },
//   { role: "user", content: "I love programming." },
// ]);
// const dim = (await embeddings.embedQuery("test")).length;
// console.log("Embedding dimension:", dim); // should print 384
// // console.log(aiMsg);
