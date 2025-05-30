import * as React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Mock api utility (replace with actual import in a real app)
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/documents/",
});

interface Document {
  id: number;
  category_id: number;
  doc_type_id: number;
  subtype_id: number;
  doc_date: string;
  party_main_account: string;
  party_sub_account: string;
  file_path: string;
  file_name: string;
  uploaded_by: string;
  uploaded_date: string;
  modified_by: string;
  modified_date: string;
  remarks: string | null;
}

interface DocType {
  id: string;
  label: string;
}

interface Subtype {
  id: string;
  label: string;
}

interface FilterData {
  category_id: string;
  doc_type_id: string;
  from_date: string;
  to_date: string;
}

interface EditData {
  category_id: string;
  doc_type_id: string;
  subtype_id: string;
  doc_date: string;
  party_main_account: string;
  party_sub_account: string;
  modified_by: string;
  remarks: string;
}

const Dashboard: React.FC = () => {
  const [uid, setUid] = useState<string>("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [editData, setEditData] = useState<EditData>({
    category_id: "",
    doc_type_id: "",
    subtype_id: "",
    doc_date: "",
    party_main_account: "",
    party_sub_account: "",
    modified_by: "",
    remarks: "",
  });
  const [filterData, setFilterData] = useState<FilterData>({
    category_id: "",
    doc_type_id: "",
    from_date: "",
    to_date: "",
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isViewing, setIsViewing] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const categories: { id: string; label: string }[] = [
    { id: "1", label: "Advertisement" },
    { id: "2", label: "Vendor" },
    { id: "3", label: "Circulation" },
  ];

  const docTypes: DocType[] = [
    { id: "1", label: "KYC" },
    { id: "2", label: "Accounting" },
    { id: "3", label: "Legal" },
  ];

  const subtypes: { [key: string]: Subtype[] } = {
    "1": [
      { id: "1", label: "Aadhar" },
      { id: "2", label: "Pan" },
      { id: "3", label: "DL" },
      { id: "4", label: "Application Form" },
      { id: "5", label: "Bank Guarantee" },
    ],
    "2": [
      { id: "1", label: "Bills" },
      { id: "2", label: "Receipts" },
      { id: "3", label: "CN" },
      { id: "4", label: "DN" },
    ],
    "3": [
      { id: "1", label: "Notices" },
      { id: "2", label: "Reminder" },
    ],
  };

  // Fetch uid from localStorage on mount
  useEffect(() => {
    const storedUid = localStorage.getItem("user_id");
    if (storedUid) {
      setUid(storedUid);
    } else {
      setMessage("No user ID found. Please log in.");
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [navigate]);

  // Fetch documents when uid changes
  useEffect(() => {
    if (uid) {
      fetchDocs();
    }
  }, [uid]);

  const fetchDocs = async (useFilter: boolean = false) => {
    setIsLoading(true);
    try {
      let url = `user/${uid}`;
      if (useFilter) {
        const params = new URLSearchParams();
        if (filterData.category_id)
          params.append("category_id", filterData.category_id);
        if (filterData.doc_type_id)
          params.append("doc_type_id", filterData.doc_type_id);
        if (filterData.from_date)
          params.append("from_date", filterData.from_date);
        if (filterData.to_date) params.append("to_date", filterData.to_date);
        url = `user/${uid}/filter?${params.toString()}`;
      }
      const response = await api.get(url);
      setDocuments(Array.isArray(response.data) ? response.data : []);
      setMessage("");
    } catch (error: any) {
      console.error(
        "Error fetching documents:",
        error.response?.data || error.message
      );
      setMessage("Failed to load documents.");
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (docId: number) => {
    setIsLoading(true);
    try {
      await api.delete(`/${docId}?uid=${uid}`);
      fetchDocs();
      setMessage("Document deleted successfully.");
    } catch (error: any) {
      console.error(
        "Error deleting document:",
        error.response?.data || error.message
      );
      setMessage("Failed to delete document.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (doc: Document) => {
    setSelectedDoc(doc);
    setEditData({
      category_id: doc.category_id.toString(),
      doc_type_id: doc.doc_type_id.toString(),
      subtype_id: doc.subtype_id.toString(),
      doc_date: doc.doc_date,
      party_main_account: doc.party_main_account,
      party_sub_account: doc.party_sub_account,
      modified_by: doc.uploaded_by,
      remarks: doc.remarks || "",
    });
    setIsEditing(true);
  };

  const handleViewClick = (doc: Document) => {
    setSelectedDoc(doc);
    setIsViewing(true);
  };

  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilterData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "doc_type_id" ? { subtype_id: "" } : {}),
    }));
  };

  const handleEditSubmit = async () => {
    if (!selectedDoc) return;
    setIsLoading(true);
    try {
      await api.put(`/${selectedDoc.id}`, editData);
      setIsEditing(false);
      setMessage("Document updated successfully.");
      fetchDocs();
    } catch (error: any) {
      console.error(
        "Error updating document:",
        error.response?.data || error.message
      );
      setMessage("Failed to update document.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleClearFilter = () => {
    setFilterData({
      category_id: "",
      doc_type_id: "",
      from_date: "",
      to_date: "",
    });
    fetchDocs(false);
  };
  const handleFilterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetchDocs(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar for Filters */}
      <div className="w-80 bg-white shadow-md p-6 fixed h-screen overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Filter Documents
        </h2>
        <form onSubmit={handleFilterSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="category_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <select
              id="category_id"
              name="category_id"
              value={filterData.category_id}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-colors"
            >
              <option value="" disabled>
                Select Category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="doc_type_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Document Type
            </label>
            <select
              id="doc_type_id"
              name="doc_type_id"
              value={filterData.doc_type_id}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-colors"
            >
              <option value="" disabled>
                Select Document Type
              </option>
              {docTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="from_date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              From Date
            </label>
            <input
              id="from_date"
              type="date"
              name="from_date"
              value={filterData.from_date}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="to_date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              To Date
            </label>
            <input
              id="to_date"
              type="date"
              name="to_date"
              value={filterData.to_date}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-colors"
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Filtering...
                </span>
              ) : (
                "Apply Filter"
              )}
            </button>
            <button
              type="button"
              onClick={handleClearFilter}
              disabled={isLoading}
              className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Clear Filter
            </button>
          </div>
        </form>
      </div>

      {/* Main Content */}
      <div className="ml-80 p-6 flex-1">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Your Documents
        </h1>

        {message && (
          <p className="mb-4 text-red-500 text-center bg-red-50 p-2 rounded">
            {message}
          </p>
        )}

        {/* Document List */}
        <div className="space-y-4">
          {isLoading && !documents.length ? (
            <div className="flex justify-center items-center">
              <svg
                className="animate-spin h-8 w-8 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : documents.length > 0 ? (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center space-x-4">
                  {doc.file_name.toLowerCase().endsWith(".pdf") ? (
                    <embed
                      src={`http://127.0.0.1:8000/documents/file/${doc.id}`}
                      type="application/pdf"
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) =>
                        (e.currentTarget.outerHTML =
                          '<img src="/fallback-image.png" class="w-16 h-16 object-cover rounded" />')
                      }
                    />
                  ) : (
                    <img
                      src={`http://127.0.0.1:8000/documents/file/${doc.id}`}
                      alt={doc.file_name}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) =>
                        (e.currentTarget.src = "/fallback-image.png")
                      }
                    />
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">
                      {doc.file_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {docTypes.find((t) => t.id === doc.doc_type_id.toString())
                        ?.label || doc.doc_type_id}{" "}
                      -{" "}
                      {subtypes[doc.doc_type_id.toString()]?.find(
                        (s) => s.id === doc.subtype_id.toString()
                      )?.label || doc.subtype_id}
                    </p>
                  </div>
                </div>
                <div className="space-x-2">
                  <button
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    onClick={() => handleViewClick(doc)}
                    disabled={isLoading}
                  >
                    View
                  </button>
                  <button
                    className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
                    onClick={() => handleEditClick(doc)}
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:text-red-700 font-medium transition-colors"
                    onClick={() => handleDelete(doc.id)}
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No documents found.</p>
          )}
        </div>

        {/* Floating Upload Button */}
        <button
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-xl"
          onClick={() => navigate("/upload")}
        >
          ➕
        </button>

        {/* Edit Modal */}
        {isEditing && selectedDoc && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition-opacity duration-300">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md text-gray-800">
              <h2 className="text-xl font-bold mb-4">Edit Document</h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="edit_category_id"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Category
                  </label>
                  <select
                    id="edit_category_id"
                    name="category_id"
                    value={editData.category_id}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-colors"
                  >
                    <option value="" disabled>
                      Select Category
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="edit_doc_type_id"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Document Type
                  </label>
                  <select
                    id="edit_doc_type_id"
                    name="doc_type_id"
                    value={editData.doc_type_id}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-colors"
                  >
                    <option value="" disabled>
                      Select Document Type
                    </option>
                    {docTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="edit_subtype_id"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Subtype
                  </label>
                  <select
                    id="edit_subtype_id"
                    name="subtype_id"
                    value={editData.subtype_id}
                    onChange={handleEditChange}
                    disabled={!editData.doc_type_id}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-colors disabled:bg-gray-200"
                  >
                    <option value="" disabled>
                      Select Subtype
                    </option>
                    {editData.doc_type_id &&
                      subtypes[editData.doc_type_id]?.map((subtype) => (
                        <option key={subtype.id} value={subtype.id}>
                          {subtype.label}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="edit_doc_date"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Document Date
                  </label>
                  <input
                    id="edit_doc_date"
                    type="date"
                    name="doc_date"
                    value={editData.doc_date}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit_party_main_account"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Main Account
                  </label>
                  <input
                    id="edit_party_main_account"
                    type="text"
                    name="party_main_account"
                    value={editData.party_main_account}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit_party_sub_account"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Sub Account
                  </label>
                  <input
                    id="edit_party_sub_account"
                    type="text"
                    name="party_sub_account"
                    value={editData.party_sub_account}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit_remarks"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Remarks
                  </label>
                  <textarea
                    id="edit_remarks"
                    name="remarks"
                    value={editData.remarks}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-colors"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-2">
                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                  onClick={handleEditSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {isViewing && selectedDoc && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start p-4 transition-opacity duration-300">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl h-[calc(100vh-2rem)] overflow-y-auto text-gray-800">
              <div className="sticky top-0 bg-white p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold">Document Details</h2>
              </div>
              <div className="p-6 space-y-4">
                {selectedDoc.file_name.toLowerCase().endsWith(".pdf") ? (
                  <embed
                    src={`http://127.0.0.1:8000/documents/file/${selectedDoc.id}`}
                    type="application/pdf"
                    className="w-full h-64 object-contain rounded"
                    onError={(e) =>
                      (e.currentTarget.outerHTML =
                        '<img src="/fallback-image.png" class="w-full h-64 object-contain rounded" />')
                    }
                  />
                ) : (
                  <img
                    src={`http://127.0.0.1:8000/documents/file/${selectedDoc.id}`}
                    alt={selectedDoc.file_name}
                    className="w-full h-64 object-contain rounded"
                    onError={(e) =>
                      (e.currentTarget.src = "/fallback-image.png")
                    }
                  />
                )}
                <p>
                  <strong>File Name:</strong> {selectedDoc.file_name}
                </p>
                <p>
                  <strong>Category:</strong>{" "}
                  {categories.find(
                    (c) => c.id === selectedDoc.category_id.toString()
                  )?.label || selectedDoc.category_id}
                </p>
                <p>
                  <strong>Document Type:</strong>{" "}
                  {docTypes.find(
                    (t) => t.id === selectedDoc.doc_type_id.toString()
                  )?.label || selectedDoc.doc_type_id}
                </p>
                <p>
                  <strong>Subtype:</strong>{" "}
                  {subtypes[selectedDoc.doc_type_id.toString()]?.find(
                    (s) => s.id === selectedDoc.subtype_id.toString()
                  )?.label || selectedDoc.subtype_id}
                </p>
                <p>
                  <strong>Document Date:</strong> {selectedDoc.doc_date}
                </p>
                <p>
                  <strong>Main Account:</strong>{" "}
                  {selectedDoc.party_main_account}
                </p>
                <p>
                  <strong>Sub Account:</strong> {selectedDoc.party_sub_account}
                </p>
                <p>
                  <strong>Uploaded Date:</strong>{" "}
                  {new Date(selectedDoc.uploaded_date).toLocaleString()}
                </p>
                <p>
                  <strong>Modified Date:</strong>{" "}
                  {new Date(selectedDoc.modified_date).toLocaleString()}
                </p>
                <p>
                  <strong>Remarks:</strong> {selectedDoc.remarks || "None"}
                </p>
              </div>
              <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200 flex justify-end">
                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  onClick={() => setIsViewing(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Dashboard;
