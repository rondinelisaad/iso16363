import { PrismaClient } from '@prisma/client';

type SectionInput = {
  id: string;
  code: string;
  title: string;
  level: number;
  parentId: string | null;
  normText?: string;
  supportingText?: string;
  evidenceExamples?: string;
  discussion?: string;
};

const sections: SectionInput[] = [
  // ── Level 1 ────────────────────────────────────────────────────────────────
  { id: '3', code: '3', title: 'Organizational Infrastructure', level: 1, parentId: null },
  { id: '4', code: '4', title: 'Digital Object Management', level: 1, parentId: null },
  { id: '5', code: '5', title: 'Infrastructure and Security Risk Management', level: 1, parentId: null },

  // ── Level 2 — Section 3 subsections ────────────────────────────────────────
  { id: '3.1', code: '3.1', title: 'Governance and Organizational Viability', level: 2, parentId: '3' },
  { id: '3.2', code: '3.2', title: 'Organizational Structure and Staffing', level: 2, parentId: '3' },
  { id: '3.3', code: '3.3', title: 'Procedural Accountability and Preservation Policy Framework', level: 2, parentId: '3' },
  { id: '3.4', code: '3.4', title: 'Financial Sustainability', level: 2, parentId: '3' },
  { id: '3.5', code: '3.5', title: 'Contracts, Licenses, and Liabilities', level: 2, parentId: '3' },

  // ── Level 2 — Section 4 subsections ────────────────────────────────────────
  { id: '4.1', code: '4.1', title: 'Ingest: Acquisition of Content', level: 2, parentId: '4' },
  { id: '4.2', code: '4.2', title: 'Ingest: Creation of the AIP', level: 2, parentId: '4' },
  { id: '4.3', code: '4.3', title: 'Preservation Planning', level: 2, parentId: '4' },
  { id: '4.4', code: '4.4', title: 'AIP Preservation', level: 2, parentId: '4' },
  { id: '4.5', code: '4.5', title: 'Information Management', level: 2, parentId: '4' },
  { id: '4.6', code: '4.6', title: 'Access Management', level: 2, parentId: '4' },

  // ── Level 2 — Section 5 subsections ────────────────────────────────────────
  { id: '5.1', code: '5.1', title: 'Technical Infrastructure Risk Management', level: 2, parentId: '5' },
  { id: '5.2', code: '5.2', title: 'Security Risk Management', level: 2, parentId: '5' },

  // ── Level 3 — 3.1 Metrics ──────────────────────────────────────────────────
  {
    id: '3.1.1', code: '3.1.1', title: 'Mission Statement', level: 3, parentId: '3.1',
    normText: 'The repository shall have a mission statement that reflects a commitment to the preservation of, long term retention of, management of, and access to digital information.',
    supportingText: 'The mission statement should be publicly available and reviewed periodically to ensure it remains aligned with the repository\'s activities.',
    evidenceExamples: 'Published mission statement, charter document, founding legislation, board-approved policy document',
    discussion: 'The mission statement establishes the fundamental commitment of the repository to its Designated Community and to long-term preservation. It should explicitly reference digital preservation and long-term access.',
  },
  {
    id: '3.1.2', code: '3.1.2', title: 'Governance Responsibilities', level: 3, parentId: '3.1',
    normText: 'The repository shall have contracts, licenses, or liabilities that specify and transfer responsibilities as required.',
    supportingText: 'Responsibilities for governance, oversight, and accountability must be formalized through appropriate legal or organizational mechanisms.',
    evidenceExamples: 'Board governance documents, institutional charter, MOU with parent institution, governance policy, legal establishment documents',
    discussion: 'This requirement ensures the repository operates within a governance framework that clearly establishes who is accountable for repository operations and preservation commitments.',
  },

  // ── Level 3 — 3.2 Metrics ──────────────────────────────────────────────────
  {
    id: '3.2.1', code: '3.2.1', title: 'Staff Development Programs', level: 3, parentId: '3.2',
    normText: 'The repository shall have appropriate programs for the staff to be kept current with the relevant fields of theory and practice.',
    supportingText: 'This includes training programs, conference participation, professional memberships, and access to current literature in digital preservation.',
    evidenceExamples: 'Training records, conference attendance logs, professional development budgets, subscriptions to relevant journals',
    discussion: 'Staff must be kept current with rapidly evolving digital preservation practices, standards, and technologies.',
  },
  {
    id: '3.2.2', code: '3.2.2', title: 'Staff Succession Planning', level: 3, parentId: '3.2',
    normText: 'The repository shall have an appropriate succession plan for essential staff.',
    supportingText: 'Knowledge and skills must not be concentrated in a single person. The plan should cover all roles essential to repository operations.',
    evidenceExamples: 'Succession plan document, cross-training records, documented procedures enabling staff transitions',
    discussion: 'Loss of key personnel is a recognized risk to repository continuity. Succession planning mitigates this risk.',
  },
  {
    id: '3.2.3', code: '3.2.3', title: 'Organizational Chart', level: 3, parentId: '3.2',
    normText: 'The repository shall have and maintain a current organizational chart.',
    supportingText: 'The organizational chart should clearly show reporting lines, units responsible for preservation functions, and relationships to parent organizations.',
    evidenceExamples: 'Current organizational chart, annual review records of organizational structure',
    discussion: 'A documented organizational structure helps demonstrate accountability and ensures all preservation functions are assigned to appropriate units.',
  },
  {
    id: '3.2.4', code: '3.2.4', title: 'Roles and Responsibilities', level: 3, parentId: '3.2',
    normText: 'The repository shall have identified roles, responsibilities, and authorizations related to implementing the mandates of the repository.',
    supportingText: 'Job descriptions, role definitions, and authorization matrices should document who can perform which preservation-related actions.',
    evidenceExamples: 'Job descriptions, role/responsibility matrix, authorization policies, position descriptions',
    discussion: 'Clear role definitions prevent preservation tasks from falling through the cracks and establish accountability for each function.',
  },
  {
    id: '3.2.5', code: '3.2.5', title: 'Adequate Staffing', level: 3, parentId: '3.2',
    normText: 'The repository shall have adequate staff to support all functions and services.',
    supportingText: 'Staffing levels must be sufficient to perform all required ingest, preservation planning, storage management, and access functions.',
    evidenceExamples: 'Staffing assessment documents, workload analysis, FTE allocation records, service level reports',
    discussion: 'Understaffing is a common cause of preservation failures. Staffing levels must be matched to the scope of operations.',
  },
  {
    id: '3.2.6', code: '3.2.6', title: 'Current Preservation Practice Awareness', level: 3, parentId: '3.2',
    normText: 'The repository shall ensure that all staff relevant to the preservation function maintain current awareness of digital preservation trends, standards, and practices.',
    supportingText: 'Staff should participate in relevant professional communities such as DPC, iPRES, and Digital Preservation Coalition activities.',
    evidenceExamples: 'Professional organization membership records, training certificates, workshop attendance, internal knowledge-sharing records',
    discussion: 'Digital preservation is a rapidly evolving field. Staff must stay current to make informed preservation decisions.',
  },
  {
    id: '3.2.7', code: '3.2.7', title: 'Documented Staffing Requirements', level: 3, parentId: '3.2',
    normText: 'The repository shall have documentation identifying the expertise and staffing levels required for each preservation function.',
    supportingText: 'This documentation should serve as the basis for hiring decisions, training needs assessments, and succession planning.',
    evidenceExamples: 'Skills matrix, staffing requirements document, competency frameworks, annual staffing review reports',
    discussion: 'Explicit documentation of staffing requirements provides a baseline for evaluating whether the repository is adequately resourced.',
  },

  // ── Level 3 — 3.3 Metrics ──────────────────────────────────────────────────
  {
    id: '3.3.1', code: '3.3.1', title: 'Designated Community Definition', level: 3, parentId: '3.3',
    normText: 'The repository shall have defined its Designated Community and documented this definition.',
    supportingText: 'The Designated Community definition shapes all preservation decisions, particularly regarding Representation Information adequacy and access services.',
    evidenceExamples: 'Designated Community policy document, collection scope statement, user needs assessment',
    discussion: 'The concept of the Designated Community, from the OAIS Reference Model, is fundamental to understanding preservation requirements.',
  },
  {
    id: '3.3.2', code: '3.3.2', title: 'Preservation Policies', level: 3, parentId: '3.3',
    normText: 'The repository shall have preservation policies that address its commitment to preserve and provide access to designated digital objects.',
    supportingText: 'Policies should cover what is preserved, for how long, at what quality level, and for whom.',
    evidenceExamples: 'Preservation policy document, digital preservation strategy, collection development policy, retention schedule',
    discussion: 'Preservation policies provide the framework within which all preservation decisions are made. They must be publicly accessible and regularly reviewed.',
  },
  {
    id: '3.3.3', code: '3.3.3', title: 'Preservation Strategic Plan', level: 3, parentId: '3.3',
    normText: 'The repository shall have and maintain a current preservation strategic plan.',
    supportingText: 'The strategic plan should identify goals, timelines, resources, and metrics for achievement. It must be reviewed and updated regularly.',
    evidenceExamples: 'Current strategic plan, strategic plan review records, plan update history',
    discussion: 'A strategic plan demonstrates forward-looking commitment to preservation and provides a roadmap for continuous improvement.',
  },
  {
    id: '3.3.4', code: '3.3.4', title: 'Dissolution Succession Plan', level: 3, parentId: '3.3',
    normText: 'The repository shall have a succession plan for the digital objects in its custody in the event of the repository ceasing to operate.',
    supportingText: 'The plan should identify which organizations would assume responsibility for the repository\'s holdings and under what conditions.',
    evidenceExamples: 'Successor institution agreements, dissolution policy, MOU with potential successors, board-approved dissolution plan',
    discussion: 'No repository can guarantee eternal operation. A succession plan ensures digital objects continue to be preserved if the repository closes.',
  },
  {
    id: '3.3.5', code: '3.3.5', title: 'Preservation Policy Framework', level: 3, parentId: '3.3',
    normText: 'The repository shall have a comprehensive preservation policy framework that establishes rules and procedures for all major archival operations.',
    supportingText: 'The framework should include policies for ingest, storage, access, preservation planning, and disaster recovery.',
    evidenceExamples: 'Policy framework document, policy index, procedure manuals covering all major operations',
    discussion: 'A coherent policy framework ensures consistent practice across all preservation activities and provides the basis for staff decision-making.',
  },
  {
    id: '3.3.6', code: '3.3.6', title: 'Accepted Content Specifications', level: 3, parentId: '3.3',
    normText: 'The repository shall have documented specifications for the types of content it will accept, defined with regard to the understanding of its Designated Community.',
    supportingText: 'Specifications should cover file formats, metadata requirements, submission package structures, and content scope.',
    evidenceExamples: 'Accepted formats list, submission guidelines, content scope policy, metadata requirements documentation',
    discussion: 'Clear acceptance specifications enable producers to prepare appropriate submissions and allow the repository to make consistent ingest decisions.',
  },
  {
    id: '3.3.7', code: '3.3.7', title: 'Operational Transparency', level: 3, parentId: '3.3',
    normText: 'The repository shall maintain transparent, documented evidence of its operations and adherence to its stated policies.',
    supportingText: 'Transparency includes public reporting on operations, open documentation of policies and procedures, and audit trail maintenance.',
    evidenceExamples: 'Annual reports, published operational statistics, public policy documents, audit trail logs',
    discussion: 'Transparency enables external validation of the repository\'s compliance with its stated commitments and builds community trust.',
  },
  {
    id: '3.3.8', code: '3.3.8', title: 'Administrative Processes', level: 3, parentId: '3.3',
    normText: 'The repository shall have established administrative processes to accomplish the repository\'s mission.',
    supportingText: 'Administrative processes include financial management, staff management, vendor management, and oversight reporting.',
    evidenceExamples: 'Administrative procedure manuals, financial management policies, vendor contracts, board reporting records',
    discussion: 'Effective administrative processes are prerequisites for sustainable repository operation.',
  },
  {
    id: '3.3.9', code: '3.3.9', title: 'Communication with Designated Community', level: 3, parentId: '3.3',
    normText: 'The repository shall have open and transparent communications with its Designated Community about its services, policies, and operational status.',
    supportingText: 'Communication channels should be documented and actively maintained. The community should have mechanisms for providing feedback.',
    evidenceExamples: 'Communication policy, community newsletter, stakeholder consultation records, feedback mechanisms documentation',
    discussion: 'Ongoing dialogue with the Designated Community ensures the repository remains relevant and services continue to meet community needs.',
  },
  {
    id: '3.3.10', code: '3.3.10', title: 'Policy Review Process', level: 3, parentId: '3.3',
    normText: 'The repository shall have a documented process for the periodic review and update of its policies and procedures.',
    supportingText: 'Reviews should be scheduled at regular intervals and triggered by significant operational changes or external developments.',
    evidenceExamples: 'Policy review schedule, review meeting minutes, change log for policies, version-controlled policy documents',
    discussion: 'Regular policy review ensures that policies remain current and effective as technology, standards, and community needs evolve.',
  },

  // ── Level 3 — 3.4 Metrics ──────────────────────────────────────────────────
  {
    id: '3.4.1', code: '3.4.1', title: 'Transparent Financial Practices', level: 3, parentId: '3.4',
    normText: 'The repository shall have financial practices that are transparent, compliant with relevant accounting standards, and support the needs of the repository.',
    supportingText: 'Financial records should be audited annually and made available to relevant stakeholders.',
    evidenceExamples: 'Audited financial statements, accounting policy documents, financial management procedures, external audit reports',
    discussion: 'Financial transparency is essential for demonstrating long-term viability and for maintaining stakeholder confidence.',
  },
  {
    id: '3.4.2', code: '3.4.2', title: 'Documented Financial Plans', level: 3, parentId: '3.4',
    normText: 'The repository shall have documented plans for securing ongoing financial support adequate to accomplish its preservation mission.',
    supportingText: 'Plans should identify current funding sources, diversification strategies, and contingencies for funding shortfalls.',
    evidenceExamples: 'Multi-year financial plan, fundraising strategy, business plan, diversified funding source documentation',
    discussion: 'Long-term preservation commitment requires sustained financial support. The repository must demonstrate a realistic plan for maintaining that support.',
  },
  {
    id: '3.4.3', code: '3.4.3', title: 'Financial Crisis Planning', level: 3, parentId: '3.4',
    normText: 'The repository shall have financial mechanisms and plans to handle an organizational financial crisis.',
    supportingText: 'This includes contingency reserves, insurance coverage, lines of credit, or other mechanisms for maintaining operations during financial disruption.',
    evidenceExamples: 'Financial contingency plan, reserve fund documentation, insurance policies, line of credit agreements',
    discussion: 'Even well-funded repositories face potential financial crises. Planning for these scenarios demonstrates commitment to long-term preservation obligations.',
  },
  {
    id: '3.4.4', code: '3.4.4', title: 'Preservation Cost Budget Planning', level: 3, parentId: '3.4',
    normText: 'The repository shall maintain a documented budget planning process that explicitly addresses the costs of all preservation activities.',
    supportingText: 'The budget process should identify costs for staffing, infrastructure, services, and future preservation activities including technology refreshment.',
    evidenceExamples: 'Annual budget documents, multi-year cost projections, cost modeling reports, technology refresh budget allocations',
    discussion: 'Preservation activities have predictable and unpredictable costs. A structured budget process ensures adequate resources are allocated.',
  },

  // ── Level 3 — 3.5 Metrics ──────────────────────────────────────────────────
  {
    id: '3.5.1', code: '3.5.1', title: 'Deposit Agreements', level: 3, parentId: '3.5',
    normText: 'The repository shall have appropriate contracts or deposit agreements for all digital objects deposited with it.',
    supportingText: 'Deposit agreements should specify rights transferred, preservation commitments, access terms, and liabilities.',
    evidenceExamples: 'Deposit agreement templates, signed deposit agreements, MOU examples, producer agreement framework',
    discussion: 'Deposit agreements establish the legal basis for the repository\'s custody and preservation activities.',
  },
  {
    id: '3.5.2', code: '3.5.2', title: 'Preservation License Rights', level: 3, parentId: '3.5',
    normText: 'The repository shall have deposit agreements or license rights that allow it to carry out all preservation activities.',
    supportingText: 'These must include rights to copy, migrate, transform, and provide access to digital objects as required for long-term preservation.',
    evidenceExamples: 'License agreements granting preservation rights, legal review documentation, rights statement templates',
    discussion: 'Copyright and other intellectual property restrictions can prevent necessary preservation activities unless appropriate rights have been secured in advance.',
  },
  {
    id: '3.5.3', code: '3.5.3', title: 'Intellectual Property Rights Tracking', level: 3, parentId: '3.5',
    normText: 'The repository shall track and manage intellectual property rights and restrictions on use of repository content as required by applicable agreements.',
    supportingText: 'Rights metadata should be recorded for each object and actively managed throughout the preservation lifecycle.',
    evidenceExamples: 'Rights management records, rights metadata schema, rights tracking system documentation, rights review procedures',
    discussion: 'Failure to track and respect intellectual property rights exposes the repository to legal risk and can prevent legitimate access.',
  },
  {
    id: '3.5.4', code: '3.5.4', title: 'Digital Object Succession Plans', level: 3, parentId: '3.5',
    normText: 'The repository shall have documented succession plans for digital objects for which it accepts preservation responsibility.',
    supportingText: 'Plans should identify what happens to the objects if the repository closes or transfers custody to another institution.',
    evidenceExamples: 'Succession agreement with partner institutions, dissolution policy covering object custody, transfer agreements',
    discussion: 'Objects accepted for long-term preservation must have a clear succession path ensuring ongoing availability.',
  },
  {
    id: '3.5.5', code: '3.5.5', title: 'Legal Authority for Preservation', level: 3, parentId: '3.5',
    normText: 'The repository shall have documented legal authority to carry out all preservation activities on all content in its custody.',
    supportingText: 'This includes authority derived from institutional mandate, legislation, contracts, and licenses.',
    evidenceExamples: 'Enabling legislation, institutional charter, legal opinion on preservation authority, contract provisions granting authority',
    discussion: 'The repository must have unambiguous legal authority for all preservation actions, including format migration and metadata augmentation.',
  },

  // ── Level 3 — 4.1 Metrics ──────────────────────────────────────────────────
  {
    id: '4.1.1', code: '4.1.1', title: 'Content Information Identification', level: 3, parentId: '4.1',
    normText: 'The repository shall identify the Content Information and the Information Properties that the repository will preserve.',
    supportingText: 'This includes identifying which properties of digital objects are significant and must be maintained through any preservation transformations.',
    evidenceExamples: 'Significant properties documentation, content scope policy, format profiles, representation information registry',
    discussion: 'Understanding what must be preserved about each class of digital object is foundational to all preservation planning and action.',
  },
  {
    id: '4.1.2', code: '4.1.2', title: 'Submission Agreements', level: 3, parentId: '4.1',
    normText: 'The repository shall have documented submission agreements that specify the information to be deposited, the form in which it will be deposited, and the responsibilities of both parties.',
    supportingText: 'Submission agreements should be customized for each producer and reviewed regularly.',
    evidenceExamples: 'Submission agreement templates, signed agreements with producers, SIP specifications per agreement',
    discussion: 'Submission agreements formalize the relationship between the repository and content producers and establish clear expectations for the ingest process.',
  },
  {
    id: '4.1.3', code: '4.1.3', title: 'Defined SIP Formats', level: 3, parentId: '4.1',
    normText: 'The repository shall have defined what Submission Information Packages (SIPs) it will accept, including file formats, metadata schemas, and packaging structures.',
    supportingText: 'Accepted SIP formats should be documented in a publicly available specification and kept current with evolving standards.',
    evidenceExamples: 'SIP format specification, accepted file formats list, metadata schema documentation, packaging specification',
    discussion: 'Clear SIP specifications enable producers to prepare compliant submissions and reduce the ingest quality assurance burden.',
  },
  {
    id: '4.1.4', code: '4.1.4', title: 'SIP Type Specifications', level: 3, parentId: '4.1',
    normText: 'The repository shall have detailed specifications for each type of SIP it accepts.',
    supportingText: 'Specifications should include technical format requirements, mandatory metadata fields, file naming conventions, and any transformations the repository will perform.',
    evidenceExamples: 'SIP type specifications, technical requirements documents, metadata crosswalks, submission guidelines per content type',
    discussion: 'Detailed SIP specifications enable consistent quality assurance and reduce the need for renegotiation with producers.',
  },
  {
    id: '4.1.5', code: '4.1.5', title: 'SIP Source Authentication', level: 3, parentId: '4.1',
    normText: 'The repository shall have mechanisms to authenticate the source of all received SIPs.',
    supportingText: 'Authentication mechanisms may include digital signatures, checksums, secure transfer protocols, and identity verification procedures.',
    evidenceExamples: 'Authentication procedures documentation, digital signature verification records, secure transfer protocol configuration',
    discussion: 'Authentication of SIP sources ensures the repository receives content from authorized producers and that content has not been altered in transit.',
  },
  {
    id: '4.1.6', code: '4.1.6', title: 'Sufficient Control Over Digital Objects', level: 3, parentId: '4.1',
    normText: 'The repository shall obtain sufficient control over digital objects to preserve them.',
    supportingText: 'Control includes physical custody, legal rights, and technical access sufficient to perform all required preservation actions.',
    evidenceExamples: 'Custody transfer records, legal authority documentation, access control records, object receipt confirmations',
    discussion: 'Without sufficient control over digital objects, the repository cannot fulfill its preservation commitments.',
  },
  {
    id: '4.1.7', code: '4.1.7', title: 'SIP Quality Assurance', level: 3, parentId: '4.1',
    normText: 'The repository shall have a system of quality assurance for the verification of SIPs at ingest.',
    supportingText: 'QA should include format validation, checksum verification, virus scanning, completeness checking, and metadata validation.',
    evidenceExamples: 'QA procedures documentation, automated validation tool configurations, QA checklist, QA reports',
    discussion: 'Quality assurance at ingest is the first line of defense against preserving corrupted, incomplete, or non-compliant content.',
  },
  {
    id: '4.1.8', code: '4.1.8', title: 'Ingest Receipts', level: 3, parentId: '4.1',
    normText: 'The repository shall provide the producer/depositor with appropriate responses and receipts at ingest, confirming receipt and QA outcome.',
    supportingText: 'Receipts should include checksums, timestamps, unique identifiers for the submission, and QA results.',
    evidenceExamples: 'Ingest receipt templates, automated receipt system documentation, producer communication records',
    discussion: 'Ingest receipts establish a record of the transaction and allow producers to verify that their content was received in the expected condition.',
  },
  {
    id: '4.1.9', code: '4.1.9', title: 'Failed SIP Handling', level: 3, parentId: '4.1',
    normText: 'The repository shall have documented procedures for handling SIPs that fail quality assurance checks.',
    supportingText: 'Procedures should define disposition options, communication with producers, escalation paths, and record-keeping requirements.',
    evidenceExamples: 'Failed SIP procedures documentation, producer notification templates, quarantine procedures, rejection records',
    discussion: 'Clear procedures for handling failed SIPs prevent quality issues from propagating into the archival store.',
  },
  {
    id: '4.1.10', code: '4.1.10', title: 'Transfer Integrity Verification', level: 3, parentId: '4.1',
    normText: 'The repository shall have mechanisms to ensure the identity and integrity of all SIPs transferred to the repository.',
    supportingText: 'Transfer integrity checks should be applied to every SIP regardless of transfer method or producer.',
    evidenceExamples: 'Checksum generation and verification procedures, transfer integrity check records, hash algorithm documentation',
    discussion: 'Transfer integrity verification ensures SIPs arrive in exactly the condition they left the producer, with no accidental or deliberate alteration.',
  },

  // ── Level 3 — 4.2 Metrics ──────────────────────────────────────────────────
  {
    id: '4.2.1', code: '4.2.1', title: 'Required Information Specification', level: 3, parentId: '4.2',
    normText: 'The repository shall clearly specify the information that needs to be associated with specific Content Information at the time of its deposit.',
    supportingText: 'Specifications should cover all metadata required for long-term preservation and access, including technical, descriptive, rights, and provenance metadata.',
    evidenceExamples: 'Metadata requirements specification, AIP content model documentation, mandatory metadata field list',
    discussion: 'Incomplete specification of required information leads to metadata gaps that may be impossible to remediate later.',
  },
  {
    id: '4.2.2', code: '4.2.2', title: 'AIP Definitions', level: 3, parentId: '4.2',
    normText: 'The repository shall have a definition for each AIP or class of AIPs it will preserve.',
    supportingText: 'AIP definitions should specify the structure, required components, metadata schemas, and content models for each object class.',
    evidenceExamples: 'AIP specification documents, content model documentation, AIP class registry, structural metadata schemas',
    discussion: 'Clear AIP definitions ensure consistent packaging and enable automated validation of archival objects.',
  },
  {
    id: '4.2.3', code: '4.2.3', title: 'SIP Disposition Documentation', level: 3, parentId: '4.2',
    normText: 'The repository shall have documented the final disposition of all SIPs, including whether they were accepted, rejected, or transformed into AIPs.',
    supportingText: 'Disposition records should be maintained indefinitely as they provide provenance information for archival objects.',
    evidenceExamples: 'SIP disposition register, ingest workflow logs, AIP creation records linked to originating SIPs',
    discussion: 'Tracking SIP disposition creates an auditable chain of custody from submission to archival storage.',
  },
  {
    id: '4.2.4', code: '4.2.4', title: 'PDI Linkage to Source SIPs', level: 3, parentId: '4.2',
    normText: 'The repository shall record in the Preservation Description Information (PDI) the SIP(s) used to generate each AIP.',
    supportingText: 'The provenance record should include the original SIP identifier, receipt timestamp, and any transformation history.',
    evidenceExamples: 'Provenance metadata records, PDI schema documentation, SIP-to-AIP relationship records',
    discussion: 'Maintaining the link from AIP to source SIP provides essential provenance information and supports authenticity claims.',
  },
  {
    id: '4.2.5', code: '4.2.5', title: 'SIP-to-AIP Transformation Description', level: 3, parentId: '4.2',
    normText: 'The repository shall have a description of how AIPs are constructed from SIPs for each AIP class.',
    supportingText: 'This should include any normalization, format transformation, metadata augmentation, or structural reorganization performed during ingest.',
    evidenceExamples: 'Ingest workflow documentation, transformation specification documents, processing pipeline descriptions',
    discussion: 'Documented transformation processes enable auditability and reproducibility of AIP creation.',
  },
  {
    id: '4.2.6', code: '4.2.6', title: 'PDI Generation Process', level: 3, parentId: '4.2',
    normText: 'The repository shall have a documented process for generating AIP Preservation Description Information from source information.',
    supportingText: 'The process should cover how technical metadata is extracted, how provenance is recorded, and how rights information is captured.',
    evidenceExamples: 'PDI generation procedure documentation, metadata extraction tool configurations, provenance recording procedures',
    discussion: 'Preservation Description Information is the cornerstone of long-term preservation. Its systematic generation ensures no preservation-critical metadata is omitted.',
  },
  {
    id: '4.2.7', code: '4.2.7', title: 'AIP Completeness Verification', level: 3, parentId: '4.2',
    normText: 'The repository shall have a documented process for verifying the validity and completeness of each AIP prior to storage.',
    supportingText: 'Verification should be automated where possible and should check structural integrity, metadata completeness, and content checksums.',
    evidenceExamples: 'AIP validation procedures, automated validation tool configurations, validation report examples, QA checklists',
    discussion: 'AIP completeness verification is the quality gate before archival storage. Issues identified here are far easier to remediate than after storage.',
  },
  {
    id: '4.2.8', code: '4.2.8', title: 'Transformation Procedures', level: 3, parentId: '4.2',
    normText: 'The repository shall have documented procedures for all data transformation processes applied during AIP creation.',
    supportingText: 'Procedures should include pre- and post-transformation validation steps, tool specifications, and exception handling.',
    evidenceExamples: 'Transformation procedure documents, tool configuration records, transformation test results, exception handling procedures',
    discussion: 'Documented transformation procedures ensure that transformations are reproducible, auditable, and consistently applied.',
  },
  {
    id: '4.2.9', code: '4.2.9', title: 'Format Identification and Validation', level: 3, parentId: '4.2',
    normText: 'The repository shall have documented procedures for identifying and validating the formats of all ingested digital objects.',
    supportingText: 'Format identification should use established tools and registries. Validation should confirm that files conform to their identified format specifications.',
    evidenceExamples: 'Format identification procedures, validation tool configurations, format registry subscriptions, identification and validation reports',
    discussion: 'Accurate format identification is a prerequisite for format-specific preservation planning and for determining appropriate access pathways.',
  },

  // ── Level 3 — 4.3 Metrics ──────────────────────────────────────────────────
  {
    id: '4.3.1', code: '4.3.1', title: 'Preservation Strategies', level: 3, parentId: '4.3',
    normText: 'The repository shall have documented preservation strategies relevant to its current holdings.',
    supportingText: 'Strategies should cover format normalization, emulation, migration, and any technology-specific approaches relevant to the repository\'s collections.',
    evidenceExamples: 'Preservation strategy documentation, format-specific strategy statements, technology watch reports informing strategy',
    discussion: 'Preservation strategies must be explicitly documented and communicated to ensure consistent application across collections and staff.',
  },
  {
    id: '4.3.2', code: '4.3.2', title: 'Representation Information Monitoring', level: 3, parentId: '4.3',
    normText: 'The repository shall have mechanisms in place for monitoring and notification when Representation Information is inadequate for the current Designated Community.',
    supportingText: 'Monitoring should include tracking technology change, community feedback, and periodic adequacy assessments.',
    evidenceExamples: 'Representation information monitoring procedures, community feedback records, adequacy assessment reports',
    discussion: 'Representation Information that is adequate today may become inadequate as technology changes and community knowledge evolves.',
  },
  {
    id: '4.3.3', code: '4.3.3', title: 'Preservation Action Plan Monitoring', level: 3, parentId: '4.3',
    normText: 'The repository shall have mechanisms for monitoring the adequacy of its digital preservation action plans.',
    supportingText: 'Monitoring should include tracking format obsolescence, tool availability, and the effectiveness of implemented strategies.',
    evidenceExamples: 'Preservation action plan monitoring procedures, format obsolescence tracking records, strategy effectiveness assessments',
    discussion: 'Preservation action plans must be regularly reviewed to ensure they remain fit for purpose as technology and formats evolve.',
  },
  {
    id: '4.3.4', code: '4.3.4', title: 'Representation Information Gathering', level: 3, parentId: '4.3',
    normText: 'The repository shall have a documented process for creating, identifying, or gathering any extra Representation Information required.',
    supportingText: 'The process should identify sources of Representation Information, methods for acquiring it, and procedures for maintaining its currency.',
    evidenceExamples: 'Representation information gathering procedure, sources registry, acquisition records, maintenance procedures',
    discussion: 'When existing Representation Information is found to be inadequate, the repository must have a systematic process for remediation.',
  },
  {
    id: '4.3.5', code: '4.3.5', title: 'Preservation Strategy per Object Class', level: 3, parentId: '4.3',
    normText: 'The repository shall have documented preservation strategies for each class of digital object it holds.',
    supportingText: 'Class-specific strategies should cover preferred formats, normalization targets, migration paths, and emulation requirements.',
    evidenceExamples: 'Per-class preservation strategy documents, format migration roadmaps, emulation requirements documentation',
    discussion: 'Different object classes require different preservation approaches. Generic strategies that do not account for class-specific characteristics may be inadequate.',
  },
  {
    id: '4.3.6', code: '4.3.6', title: 'Strategy Effectiveness Validation', level: 3, parentId: '4.3',
    normText: 'The repository shall have methods to validate that its preservation strategies remain effective over time.',
    supportingText: 'Validation may include testing preserved objects for renderability, conducting user studies, and benchmarking against industry standards.',
    evidenceExamples: 'Strategy validation test records, rendering test results, user feedback records, benchmarking reports',
    discussion: 'A strategy that is not regularly validated may fail silently, leading to discovery of preservation failures only when it is too late to remediate.',
  },
  {
    id: '4.3.7', code: '4.3.7', title: 'Preservation Trends Monitoring', level: 3, parentId: '4.3',
    normText: 'The repository shall have procedures for monitoring digital preservation trends, developments, standards, and tool evolution.',
    supportingText: 'Monitoring should include participation in professional communities, tracking standards developments, and evaluating new tools.',
    evidenceExamples: 'Technology watch procedure, standards monitoring records, professional community participation records, tool evaluation reports',
    discussion: 'Staying current with preservation trends enables the repository to adopt best practices and respond proactively to emerging risks.',
  },
  {
    id: '4.3.8', code: '4.3.8', title: 'Transformation Decision Criteria', level: 3, parentId: '4.3',
    normText: 'The repository shall have documented criteria for deciding when to perform digital object transformations.',
    supportingText: 'Criteria should address format obsolescence thresholds, significant properties requirements, technical obsolescence indicators, and access requirement changes.',
    evidenceExamples: 'Transformation decision policy, format obsolescence criteria, trigger conditions documentation, decision records',
    discussion: 'Clear documented criteria prevent both premature and delayed transformations, and ensure transformation decisions are consistently made and defensible.',
  },
  {
    id: '4.3.9', code: '4.3.9', title: 'Normalization and Transformation Process', level: 3, parentId: '4.3',
    normText: 'The repository shall have documented processes for the normalization and transformation of digital objects, including post-transformation verification.',
    supportingText: 'Processes should specify tools, parameters, validation steps, and record-keeping requirements for all transformations.',
    evidenceExamples: 'Normalization procedure documentation, transformation tool specifications, post-transformation verification procedures, transformation logs',
    discussion: 'Without documented processes, transformations cannot be consistently applied or audited, and the repository cannot demonstrate transformed objects faithfully represent the originals.',
  },

  // ── Level 3 — 4.4 Metrics ──────────────────────────────────────────────────
  {
    id: '4.4.1', code: '4.4.1', title: 'Archiving Process Policies', level: 3, parentId: '4.4',
    normText: 'The repository shall have policies and procedures that address each step in the archiving process, from receipt to long-term storage.',
    supportingText: 'Policies should be comprehensive, covering all object classes and all stages of the archival lifecycle.',
    evidenceExamples: 'Archiving process policy, procedure manuals for each process step, workflow documentation',
    discussion: 'Comprehensive archiving policies ensure that no step in the preservation lifecycle is left to ad hoc decision-making.',
  },
  {
    id: '4.4.2', code: '4.4.2', title: 'Periodic AIP Examination', level: 3, parentId: '4.4',
    normText: 'The repository shall have processes for examining all AIPs periodically to verify their integrity and ongoing preservation adequacy.',
    supportingText: 'Examination schedules should be risk-based, with higher-risk objects examined more frequently.',
    evidenceExamples: 'AIP examination schedule, examination procedures, examination result reports, exception handling records',
    discussion: 'Periodic examination detects integrity failures and preservation adequacy issues before they become irremediable.',
  },
  {
    id: '4.4.3', code: '4.4.3', title: 'Access Copy Currency', level: 3, parentId: '4.4',
    normText: 'The repository shall have processes to ensure that any access copies remain current, accurate representations of the preserved archival objects.',
    supportingText: 'When AIPs are updated or transformed, access copies must be regenerated and verified against the new archival master.',
    evidenceExamples: 'Access copy maintenance procedures, synchronization records, DIP generation procedures, access copy verification records',
    discussion: 'Stale or inaccurate access copies undermine user confidence and may result in access to outdated or corrupted content.',
  },
  {
    id: '4.4.4', code: '4.4.4', title: 'AIP Accompanying Information Definition', level: 3, parentId: '4.4',
    normText: 'The repository shall have a formal definition of the information that must accompany AIPs throughout their preservation lifecycle.',
    supportingText: 'Required information should include provenance, context, fixity, access rights, and any other metadata necessary for long-term understanding and access.',
    evidenceExamples: 'AIP metadata requirements documentation, PDI schema, information object model',
    discussion: 'Clearly defining required accompanying information prevents metadata gaps from developing over the preservation lifecycle.',
  },
  {
    id: '4.4.5', code: '4.4.5', title: 'AIP Action Audit Trail', level: 3, parentId: '4.4',
    normText: 'The repository shall maintain audit trails for all actions related to AIPs.',
    supportingText: 'Audit trails should capture who performed what action on which object at what time, and any changes to the object\'s state.',
    evidenceExamples: 'Audit trail system documentation, sample audit trail records, access log examples, action logging configuration',
    discussion: 'Audit trails are essential for demonstrating authenticity and for investigating any questions about object integrity or provenance.',
  },
  {
    id: '4.4.6', code: '4.4.6', title: 'AIP Storage Process', level: 3, parentId: '4.4',
    normText: 'The repository shall have a documented process for how AIPs are stored, including storage location assignment and metadata recording.',
    supportingText: 'Storage assignment should be deterministic and documented so that AIPs can be reliably located and retrieved.',
    evidenceExamples: 'AIP storage procedure documentation, storage location registry, storage metadata schema',
    discussion: 'A documented storage process ensures that AIPs can be reliably found and retrieved throughout their preservation lifecycle.',
  },
  {
    id: '4.4.7', code: '4.4.7', title: 'Multiple Copies with Geographic Dispersal', level: 3, parentId: '4.4',
    normText: 'The repository shall maintain multiple copies of all AIPs, with copies stored in geographically dispersed locations.',
    supportingText: 'Geographic dispersal must be sufficient to ensure that a single disaster cannot destroy all copies. Minimum recommended: three copies in two locations.',
    evidenceExamples: 'Replication policy, storage location descriptions, copy count verification records, geographic dispersal documentation',
    discussion: 'Geographic dispersal of copies is one of the most fundamental safeguards against catastrophic loss of digital content.',
  },
  {
    id: '4.4.8', code: '4.4.8', title: 'Storage Error Detection', level: 3, parentId: '4.4',
    normText: 'The repository shall have error detection mechanisms for all stored digital objects.',
    supportingText: 'Error detection should use cryptographic checksums stored separately from the objects they protect. Errors must be detected and reported promptly.',
    evidenceExamples: 'Fixity check procedures, checksum algorithm documentation, error detection reports, alert procedures',
    discussion: 'Bit rot and storage media degradation are inevitable. Without error detection mechanisms, corruption may go undetected until objects are needed.',
  },
  {
    id: '4.4.9', code: '4.4.9', title: 'Storage Recovery Testing', level: 3, parentId: '4.4',
    normText: 'The repository shall have documented and regularly tested procedures for recovering from storage failures.',
    supportingText: 'Recovery tests should be conducted at realistic scale and frequency, and results documented and acted upon.',
    evidenceExamples: 'Recovery procedure documentation, test schedule, test result records, remediation action records',
    discussion: 'An untested recovery procedure is not a recovery procedure. Regular testing reveals gaps and ensures staff are prepared for actual emergencies.',
  },

  // ── Level 3 — 4.5 Metrics ──────────────────────────────────────────────────
  {
    id: '4.5.1', code: '4.5.1', title: 'Descriptive Metadata Minimum Requirements', level: 3, parentId: '4.5',
    normText: 'The repository shall specify minimum information requirements to enable the Designated Community to discover and identify material of interest.',
    supportingText: 'Minimum requirements should be sufficient for the community to find, understand, and select relevant objects without needing to retrieve the object itself.',
    evidenceExamples: 'Minimum metadata requirements documentation, discovery metadata schema, search system configuration',
    discussion: 'Inadequate descriptive metadata prevents users from discovering and accessing the repository\'s holdings, undermining the access mission.',
  },
  {
    id: '4.5.2', code: '4.5.2', title: 'Descriptive Metadata Capture', level: 3, parentId: '4.5',
    normText: 'The repository shall capture or create minimum descriptive information for each AIP and ensure that it is associated with the AIP.',
    supportingText: 'Metadata capture processes should be automated where possible and verified during AIP creation quality assurance.',
    evidenceExamples: 'Metadata capture procedures, metadata extraction tool configurations, metadata verification records',
    discussion: 'Consistent, complete descriptive metadata capture at ingest prevents information loss and reduces the cost of later remediation.',
  },
  {
    id: '4.5.3', code: '4.5.3', title: 'AIP-Metadata Bidirectional Linkage', level: 3, parentId: '4.5',
    normText: 'The repository shall maintain bidirectional linkage between each AIP and its descriptive information.',
    supportingText: 'Linkage should be maintained in the storage system, catalog, and any derivative systems. Integrity of linkages should be verified periodically.',
    evidenceExamples: 'Linkage maintenance procedures, periodic linkage verification records, identifier management documentation',
    discussion: 'Broken AIP-metadata linkages prevent discovery and access and undermine the integrity of the archival record.',
  },
  {
    id: '4.5.4', code: '4.5.4', title: 'AIP-Documentation Associations', level: 3, parentId: '4.5',
    normText: 'The repository shall maintain the associations between AIPs and all relevant documentation throughout the preservation lifecycle.',
    supportingText: 'Documentation includes technical specifications, rights information, provenance records, and any other information supporting long-term preservation.',
    evidenceExamples: 'Association maintenance procedures, association integrity check records, documentation registry',
    discussion: 'Losing the association between an object and its supporting documentation can render the object unusable or untrustworthy.',
  },
  {
    id: '4.5.5', code: '4.5.5', title: 'Control Information Consistency', level: 3, parentId: '4.5',
    normText: 'The repository shall maintain all control information in a manner that allows for periodic consistency checking.',
    supportingText: 'Consistency checks should verify that all AIPs referenced in the catalog exist in storage, all stored objects are cataloged, and all metadata is internally consistent.',
    evidenceExamples: 'Consistency checking procedures, check schedule, consistency check reports, exception handling records',
    discussion: 'Inconsistencies between the catalog, storage system, and metadata stores are a significant risk to preservation integrity.',
  },
  {
    id: '4.5.6', code: '4.5.6', title: 'Persistent Identifiers', level: 3, parentId: '4.5',
    normText: 'The repository shall specify and use persistent, unique identifiers for all AIPs.',
    supportingText: 'Identifier systems should use established schemes (e.g., DOI, Handle, ARK) or internal schemes with documented persistence guarantees.',
    evidenceExamples: 'Identifier policy, identifier scheme documentation, identifier registry, identifier resolution service documentation',
    discussion: 'Persistent identifiers enable reliable citation and access over time. Without persistence guarantees, identifiers become broken links.',
  },
  {
    id: '4.5.7', code: '4.5.7', title: 'AIP Storage and Retrieval Specifications', level: 3, parentId: '4.5',
    normText: 'The repository shall have documented specifications for how AIPs are stored and retrieved.',
    supportingText: 'Specifications should cover storage formats, directory structures, naming conventions, and retrieval procedures.',
    evidenceExamples: 'AIP storage specification document, directory structure documentation, retrieval procedure documentation',
    discussion: 'Documented storage specifications ensure that AIPs can be reliably located and retrieved even as storage systems change over time.',
  },
  {
    id: '4.5.8', code: '4.5.8', title: 'Metadata Standards Documentation', level: 3, parentId: '4.5',
    normText: 'The repository shall document the metadata schemas and standards it uses for each class of digital object.',
    supportingText: 'Documentation should include schema versions, customizations, crosswalk mappings, and evolution history.',
    evidenceExamples: 'Metadata schema documentation, crosswalk mappings, standards compliance statements, schema version registry',
    discussion: 'Clear documentation of metadata standards enables future interpreters to understand the meaning and structure of archived metadata.',
  },

  // ── Level 3 — 4.6 Metrics ──────────────────────────────────────────────────
  {
    id: '4.6.1', code: '4.6.1', title: 'Access Policies', level: 3, parentId: '4.6',
    normText: 'The repository shall have access policies consistent with its obligations to its Designated Community and with applicable legal requirements.',
    supportingText: 'Policies should address who can access what content under what conditions, and how access rights are determined and enforced.',
    evidenceExamples: 'Access policy document, user rights framework, legal compliance documentation, access control matrix',
    discussion: 'Access policies balance the repository\'s preservation and access missions with legal, ethical, and contractual obligations.',
  },
  {
    id: '4.6.2', code: '4.6.2', title: 'Consumer Authentication', level: 3, parentId: '4.6',
    normText: 'The repository shall have mechanisms to authenticate the identity of Consumers prior to granting access.',
    supportingText: 'Authentication mechanisms should be appropriate to the access risk level and may include username/password, institutional authentication, or certificate-based systems.',
    evidenceExamples: 'Authentication system documentation, access control procedures, user registration process documentation',
    discussion: 'Authentication is a prerequisite for enforcing access restrictions and for maintaining reliable audit trails of access.',
  },
  {
    id: '4.6.3', code: '4.6.3', title: 'Access Control Mechanisms', level: 3, parentId: '4.6',
    normText: 'The repository shall have mechanisms to control access to its holdings in accordance with its access policies.',
    supportingText: 'Access controls should be technically enforced, regularly reviewed, and documented. Emergency access procedures should also be documented.',
    evidenceExamples: 'Access control system documentation, access control configuration, access review records',
    discussion: 'Without technical enforcement of access controls, policies alone are insufficient to protect restricted content.',
  },
  {
    id: '4.6.4', code: '4.6.4', title: 'Object Integrity in Delivery', level: 3, parentId: '4.6',
    normText: 'The repository shall have mechanisms to protect the integrity of digital objects and their associated metadata during delivery to users.',
    supportingText: 'Delivery mechanisms should include checksums, secure transfer protocols, and procedures for verifying object integrity upon delivery.',
    evidenceExamples: 'Delivery integrity procedures, secure transfer configuration, delivery checksum verification records',
    discussion: 'The preservation mission is not complete if objects are corrupted or altered between the archival store and the user.',
  },
  {
    id: '4.6.5', code: '4.6.5', title: 'Access Logging', level: 3, parentId: '4.6',
    normText: 'The repository shall log all access to digital objects.',
    supportingText: 'Access logs should record who accessed what content at what time. Logs should be protected from alteration and retained per the repository\'s retention policies.',
    evidenceExamples: 'Access logging system documentation, log retention policy, sample access logs, log protection procedures',
    discussion: 'Access logs support audit, reporting, usage statistics, rights management, and investigation of suspected misuse.',
  },

  // ── Level 3 — 5.1 Metrics ──────────────────────────────────────────────────
  {
    id: '5.1.1', code: '5.1.1', title: 'Technology Watch', level: 3, parentId: '5.1',
    normText: 'The repository shall have a technology watch function to identify and assess developments in digital technologies relevant to its preservation holdings.',
    supportingText: 'Technology watch should cover storage media, file formats, software, hardware, and networking technologies relevant to the repository\'s operations.',
    evidenceExamples: 'Technology watch procedure documentation, watch activity records, technology assessment reports, standards monitoring records',
    discussion: 'Proactive technology watching enables the repository to plan for obsolescence before it becomes a crisis.',
  },
  {
    id: '5.1.2', code: '5.1.2', title: 'Hardware and Software Sufficiency', level: 3, parentId: '5.1',
    normText: 'The repository shall have sufficient hardware and software to support all the technological requirements of the repository.',
    supportingText: 'Sufficiency should be regularly assessed against current and projected workloads, and capacity planning should be documented.',
    evidenceExamples: 'Capacity assessment reports, hardware inventory, software inventory, capacity planning documents',
    discussion: 'Inadequate hardware or software is a common cause of preservation failures, particularly for repositories with growing collections.',
  },
  {
    id: '5.1.3', code: '5.1.3', title: 'Holdings Viability Infrastructure', level: 3, parentId: '5.1',
    normText: 'The repository shall have adequate hardware and software to maintain the viability of its current and anticipated future holdings.',
    supportingText: 'Viability assessment should consider format support, storage capacity, processing capability, and network bandwidth.',
    evidenceExamples: 'Viability assessment documentation, format support matrix, storage capacity planning, infrastructure roadmap',
    discussion: 'The infrastructure must be adequate not just for current operations but for the foreseeable future of the repository\'s holdings.',
  },
  {
    id: '5.1.4', code: '5.1.4', title: 'Hardware Failure Procedures', level: 3, parentId: '5.1',
    normText: 'The repository shall have documented procedures and strategies for replacing or recovering from failing hardware.',
    supportingText: 'Procedures should cover detection, diagnosis, escalation, replacement, and recovery for all critical hardware components.',
    evidenceExamples: 'Hardware failure procedure documentation, maintenance contract records, spare parts inventory, vendor support agreements',
    discussion: 'Hardware failure is inevitable. Documented procedures ensure rapid, effective response that minimizes risk to stored content.',
  },
  {
    id: '5.1.5', code: '5.1.5', title: 'Change Management Process', level: 3, parentId: '5.1',
    normText: 'The repository shall have a documented change management process that identifies changes to critical systems and manages their impact.',
    supportingText: 'Change management should include impact assessment, testing, approval, rollout, and rollback procedures for all significant system changes.',
    evidenceExamples: 'Change management policy, change request records, change impact assessments, testing records, change approval records',
    discussion: 'Unmanaged changes to preservation systems are a significant risk. A formal change management process reduces this risk.',
  },
  {
    id: '5.1.6', code: '5.1.6', title: 'System Configuration Documentation', level: 3, parentId: '5.1',
    normText: 'The repository shall maintain current, accurate documentation of all system configurations relevant to preservation operations.',
    supportingText: 'Configuration documentation should include hardware, software, network, and storage configurations, updated whenever changes are made.',
    evidenceExamples: 'Configuration management database, system architecture documentation, software version records, network configuration documentation',
    discussion: 'Accurate configuration documentation is essential for disaster recovery and for understanding the context of any preservation actions.',
  },
  {
    id: '5.1.7', code: '5.1.7', title: 'Appropriate Storage Media', level: 3, parentId: '5.1',
    normText: 'The repository shall use appropriate, proven storage media for the long-term preservation of its holdings.',
    supportingText: 'Media selection should consider longevity, reliability, capacity, cost, and availability of support and replacement media.',
    evidenceExamples: 'Storage media selection justification, media longevity assessment, media standards compliance documentation',
    discussion: 'Not all storage media is appropriate for long-term preservation. Media selection decisions must be defensible and periodically reviewed.',
  },
  {
    id: '5.1.8', code: '5.1.8', title: 'Storage Strategy per Object Class', level: 3, parentId: '5.1',
    normText: 'The repository shall have a documented storage strategy for each class of digital object it holds.',
    supportingText: 'Storage strategies should address replication levels, geographic distribution, media types, and refresh cycles for each object class.',
    evidenceExamples: 'Storage strategy documentation by object class, replication configuration records, geographic distribution documentation',
    discussion: 'Different object classes may require different storage strategies based on their size, format, access frequency, and preservation risk profile.',
  },
  {
    id: '5.1.9', code: '5.1.9', title: 'Storage Recovery Plan Testing', level: 3, parentId: '5.1',
    normText: 'The repository shall have and regularly test a documented plan for recovering from storage failures at all levels.',
    supportingText: 'Testing should cover media failures, system failures, and catastrophic loss scenarios. Test results should be documented and acted upon.',
    evidenceExamples: 'Storage recovery plan, test schedule, test result records, remediation action records from test findings',
    discussion: 'Storage recovery plans that are not tested regularly provide false assurance. Testing is the only way to validate recovery procedures work when needed.',
  },
  {
    id: '5.1.10', code: '5.1.10', title: 'Bit Corruption Detection', level: 3, parentId: '5.1',
    normText: 'The repository shall employ technical mechanisms to detect bit corruption or loss in stored digital objects.',
    supportingText: 'Detection mechanisms should use cryptographic checksums verified at regular intervals and upon any access or transfer.',
    evidenceExamples: 'Fixity checking system documentation, checksum verification schedule, fixity check reports, error alert procedures',
    discussion: 'Bit rot is a real and pervasive threat. Without automated detection mechanisms, corruption accumulates silently until objects are rendered unusable.',
  },
  {
    id: '5.1.11', code: '5.1.11', title: 'Integrity Reporting', level: 3, parentId: '5.1',
    normText: 'The repository shall have processes to record and report on the integrity of its stored content.',
    supportingText: 'Reporting should cover fixity check results, error rates, remediation actions, and overall collection health.',
    evidenceExamples: 'Integrity reporting procedures, integrity status reports, anomaly reporting records, remediation tracking records',
    discussion: 'Systematic integrity reporting creates an auditable record of collection health and enables early identification of systemic problems.',
  },
  {
    id: '5.1.12', code: '5.1.12', title: 'Format Obsolescence Monitoring', level: 3, parentId: '5.1',
    normText: 'The repository shall have a format obsolescence watch function to identify formats at risk of becoming inaccessible.',
    supportingText: 'Monitoring should track format popularity, renderer availability, standard activity, and community use to identify obsolescence risk.',
    evidenceExamples: 'Format obsolescence monitoring procedure, format registry subscriptions, obsolescence risk assessments, migration trigger records',
    discussion: 'Format obsolescence is a primary threat to long-term digital preservation. Proactive monitoring enables planned migration before access is lost.',
  },
  {
    id: '5.1.13', code: '5.1.13', title: 'Scalability Planning', level: 3, parentId: '5.1',
    normText: 'The repository shall have documented plans for scaling its infrastructure to accommodate growth in its holdings.',
    supportingText: 'Scalability planning should consider storage, processing, network, and staffing requirements across short, medium, and long-term horizons.',
    evidenceExamples: 'Scalability assessment reports, infrastructure growth projections, capacity planning documentation, scalability roadmap',
    discussion: 'Digital collections inevitably grow. Without scalability planning, the repository may face infrastructure crises as growth outpaces capacity.',
  },
  {
    id: '5.1.14', code: '5.1.14', title: 'Network Security Controls', level: 3, parentId: '5.1',
    normText: 'The repository shall have documented and implemented network security controls to protect its preservation infrastructure.',
    supportingText: 'Controls should include network segmentation, firewall configuration, intrusion detection, and secure protocols for all data transfers.',
    evidenceExamples: 'Network security policy, firewall configuration documentation, network diagram showing security zones, intrusion detection system records',
    discussion: 'The network is a primary attack vector for malicious actors. Robust network security controls protect both the integrity of preserved content and the privacy of access logs.',
  },

  // ── Level 3 — 5.2 Metrics ──────────────────────────────────────────────────
  {
    id: '5.2.1', code: '5.2.1', title: 'Security Risk Analysis', level: 3, parentId: '5.2',
    normText: 'The repository shall maintain a systematic analysis of security risk factors that may affect its holdings.',
    supportingText: 'Risk analysis should be conducted at least annually and whenever significant operational changes occur.',
    evidenceExamples: 'Security risk assessment reports, risk register, risk analysis methodology documentation, annual review records',
    discussion: 'A systematic risk analysis provides the foundation for all security control decisions and resource allocation.',
  },
  {
    id: '5.2.2', code: '5.2.2', title: 'Data Integrity Controls', level: 3, parentId: '5.2',
    normText: 'The repository shall implement controls to adequately address identified data integrity risks.',
    supportingText: 'Controls should include technical, procedural, and physical measures proportionate to the identified risks.',
    evidenceExamples: 'Security controls documentation, risk-control mapping, control effectiveness assessments, control implementation records',
    discussion: 'Security controls must be explicitly tied to identified risks. Generic controls without risk analysis may miss significant threats.',
  },
  {
    id: '5.2.3', code: '5.2.3', title: 'Staff Security Training', level: 3, parentId: '5.2',
    normText: 'The repository shall have a documented staff training program that includes security awareness and security-related responsibilities.',
    supportingText: 'Training should cover information security policies, incident reporting procedures, social engineering awareness, and role-specific security responsibilities.',
    evidenceExamples: 'Security training program documentation, training completion records, security awareness materials, training effectiveness assessments',
    discussion: 'Staff are both the greatest security asset and the greatest security vulnerability. Regular targeted training is essential.',
  },
  {
    id: '5.2.4', code: '5.2.4', title: 'Security Roles', level: 3, parentId: '5.2',
    normText: 'The repository shall have defined security roles and responsibilities, including assignment of accountability for information security.',
    supportingText: 'Security roles should be formally documented and included in job descriptions. Responsibility for key security functions must be clearly assigned.',
    evidenceExamples: 'Security role definitions, RACI matrix for security responsibilities, security policy assigning roles',
    discussion: 'Without clearly defined security roles, critical security functions may be performed inconsistently or neglected.',
  },
  {
    id: '5.2.5', code: '5.2.5', title: 'Disaster Recovery Procedures', level: 3, parentId: '5.2',
    normText: 'The repository shall have documented and regularly tested disaster recovery and business continuity procedures.',
    supportingText: 'Procedures should cover all classes of disasters, from hardware failure to site loss, and include recovery time objectives for all critical functions.',
    evidenceExamples: 'Disaster recovery plan, business continuity plan, recovery time objective documentation, disaster recovery test records',
    discussion: 'Disaster recovery plans that are not regularly tested provide false assurance. Testing must be conducted under realistic conditions.',
  },
  {
    id: '5.2.6', code: '5.2.6', title: 'Physical Security Controls', level: 3, parentId: '5.2',
    normText: 'The repository shall have suitable physical security controls to protect its storage and processing infrastructure.',
    supportingText: 'Physical controls should include access control to server rooms, environmental monitoring, fire suppression, and physical perimeter security.',
    evidenceExamples: 'Physical security policy, server room access control records, environmental monitoring system documentation, physical security assessment reports',
    discussion: 'Physical security is the foundation of all other security controls. Without adequate physical security, technical controls can be bypassed.',
  },
  {
    id: '5.2.7', code: '5.2.7', title: 'Access Audit Log', level: 3, parentId: '5.2',
    normText: 'The repository shall maintain and protect a general audit log of all access to the preservation system and its holdings.',
    supportingText: 'Logs should be retained in accordance with legal requirements and organizational policy, stored securely, and regularly reviewed.',
    evidenceExamples: 'Audit logging system documentation, log retention policy, log protection procedures, log review records',
    discussion: 'Comprehensive access audit logs are essential for detecting unauthorized access, investigating incidents, and demonstrating due diligence.',
  },
  {
    id: '5.2.8', code: '5.2.8', title: 'Hardware and Software Change Documentation', level: 3, parentId: '5.2',
    normText: 'The repository shall have documented processes for managing and recording all changes to hardware and software that may affect the preservation of digital objects.',
    supportingText: 'Change documentation should include the nature of the change, rationale, impact assessment, testing results, and approval records.',
    evidenceExamples: 'Change management records, hardware change log, software version history, change impact assessment records',
    discussion: 'Undocumented changes make it impossible to diagnose preservation failures or demonstrate the chain of custody for preserved objects.',
  },
  {
    id: '5.2.9', code: '5.2.9', title: 'Incident Response Plan', level: 3, parentId: '5.2',
    normText: 'The repository shall have a documented and tested incident response plan for handling security breaches and other preservation incidents.',
    supportingText: 'The plan should define incident categories, escalation procedures, communication plans, containment strategies, and post-incident review requirements.',
    evidenceExamples: 'Incident response plan, incident classification documentation, incident response test records, post-incident review reports',
    discussion: 'Security incidents are inevitable. Without a tested response plan, the repository may respond ineffectively, potentially worsening the impact on preserved content.',
  },
];

export async function seedIso16363(prisma: PrismaClient): Promise<void> {
  console.log('Seeding ISO 16363 taxonomy...');

  // Insert in order: level 1, then 2, then 3 to satisfy FK constraints
  const ordered = [
    ...sections.filter((s) => s.level === 1),
    ...sections.filter((s) => s.level === 2),
    ...sections.filter((s) => s.level === 3),
  ];

  for (const section of ordered) {
    await prisma.isoSection.upsert({
      where: { id: section.id },
      update: {
        code: section.code,
        title: section.title,
        level: section.level,
        parentId: section.parentId,
        normText: section.normText ?? null,
        supportingText: section.supportingText ?? null,
        evidenceExamples: section.evidenceExamples ?? null,
        discussion: section.discussion ?? null,
      },
      create: {
        id: section.id,
        code: section.code,
        title: section.title,
        level: section.level,
        parentId: section.parentId,
        normText: section.normText ?? null,
        supportingText: section.supportingText ?? null,
        evidenceExamples: section.evidenceExamples ?? null,
        discussion: section.discussion ?? null,
      },
    });
  }

  const metricCount = sections.filter((s) => s.level === 3).length;
  console.log(
    `ISO 16363 taxonomy seeded: ${sections.length} total entries (${metricCount} metrics).`,
  );
}
