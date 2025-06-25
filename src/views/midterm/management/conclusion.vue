<!--
 * @file 会议结论管理页面 - 管理角色
 * @description 管理角色组织中期会议和录入中期结论
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
-->
<template>
  <div class="conclusion-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">会议结论管理</h1>
        <p class="page-description">查看和管理中期会议的结论信息</p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="refreshData">
          <ReloadOutlined />
          刷新数据
        </a-button>
      </div>
    </div>

    <!-- 会议统计 -->
    <div class="meeting-stats">
      <a-row :gutter="24">
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card pending">
            <div class="stat-icon">
              <ClockCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.pendingSchedule }}</div>
              <div class="stat-label">待安排会议</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card scheduled">
            <div class="stat-icon">
              <CalendarOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.scheduled }}</div>
              <div class="stat-label">已安排会议</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card completed">
            <div class="stat-icon">
              <CheckCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.completed }}</div>
              <div class="stat-label">已完成中期</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card conclusion">
            <div class="stat-icon">
              <FileTextOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.pendingConclusion }}</div>
              <div class="stat-label">待录入结论</div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <a-form layout="inline" :model="filters" @finish="handleFilter">
        <a-form-item label="会议状态">
          <a-select
            v-model:value="filters.status"
            placeholder="选择状态"
            style="width: 150px"
            allow-clear
          >
            <a-select-option value="pending_schedule">待安排</a-select-option>
            <a-select-option value="scheduled">已安排</a-select-option>
            <a-select-option value="in_progress">进行中</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="会议时间">
          <a-range-picker
            v-model:value="filters.meetingDateRange"
            style="width: 240px"
          />
        </a-form-item>
        <a-form-item label="项目名称">
          <a-input
            v-model:value="filters.keyword"
            placeholder="搜索项目名称"
            style="width: 200px"
            allow-clear
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit">
              <SearchOutlined />
              查询
            </a-button>
            <a-button @click="resetFilters">
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <!-- 会议管理标签页 -->
    <div class="meeting-tabs">
      <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
        <a-tab-pane key="schedule" tab="会议安排">
          <!-- 待安排会议列表 -->
          <div class="meeting-list">
            <div
              v-for="item in pendingScheduleList"
              :key="item.id"
              class="meeting-item"
            >
              <div class="item-header">
                <div class="project-info">
                  <h4 class="project-name">{{ item.projectName }}</h4>
                  <div class="project-meta">
                    <span class="project-code">{{ item.projectCode }}</span>
                    <span class="material-status">材料审核：{{ getMaterialStatusText(item.materialStatus) }}</span>
                    <span class="submit-time">申请时间：{{ item.submitTime }}</span>
                  </div>
                </div>
                <div class="item-status">
                  <a-tag color="orange" size="large">待安排会议</a-tag>
                </div>
              </div>

              <div class="item-content">
                <div class="project-details">
                  <a-descriptions :column="3" size="small">
                    <a-descriptions-item label="项目负责人">
                      {{ item.projectLeader }}
                    </a-descriptions-item>
                    <a-descriptions-item label="项目周期">
                      {{ item.projectDuration }}
                    </a-descriptions-item>
                    <a-descriptions-item label="项目预算">
                      {{ item.projectBudget }}万元
                    </a-descriptions-item>
                  </a-descriptions>
                </div>

                <div class="material-summary">
                  <div class="summary-title">材料审核情况</div>
                  <div class="summary-content">
                    <span class="summary-item">
                      必需材料：{{ item.requiredMaterials }}/{{ item.totalRequired }} 已通过
                    </span>
                    <span class="summary-item">
                      可选材料：{{ item.optionalMaterials }} 已提交
                    </span>
                  </div>
                </div>
              </div>

              <div class="item-actions">
                <a-space>
                  <a-button type="primary" @click="scheduleMeeting(item)">
                    <CalendarOutlined />
                    安排会议
                  </a-button>
                  <a-button @click="viewProjectDetail(item)">
                    <FileTextOutlined />
                    查看详情
                  </a-button>
                </a-space>
              </div>
            </div>
          </div>
        </a-tab-pane>

        <a-tab-pane key="scheduled" tab="已安排会议">
          <!-- 已安排会议列表 -->
          <div class="meeting-list">
            <div
              v-for="item in scheduledMeetingList"
              :key="item.id"
              class="meeting-item"
            >
              <div class="item-header">
                <div class="project-info">
                  <h4 class="project-name">{{ item.projectName }}</h4>
                  <div class="project-meta">
                    <span class="project-code">{{ item.projectCode }}</span>
                    <span class="meeting-time">会议时间：{{ item.meetingTime }}</span>
                    <span class="meeting-location">会议地点：{{ item.meetingLocation }}</span>
                  </div>
                </div>
                <div class="item-status">
                  <a-tag :color="getMeetingStatusColor(item.meetingStatus)" size="large">
                    {{ getMeetingStatusText(item.meetingStatus) }}
                  </a-tag>
                </div>
              </div>

              <div class="item-content">
                <div class="meeting-details">
                  <a-descriptions :column="2" size="small">
                    <a-descriptions-item label="会议形式">
                      {{ getMeetingTypeText(item.meetingType) }}
                    </a-descriptions-item>
                    <a-descriptions-item label="主持人">
                      <span v-if="item.meetingHosts && item.meetingHosts.length > 0">
                        <a-tag 
                          v-for="host in item.meetingHosts" 
                          :key="host" 
                          color="blue" 
                          style="margin-right: 4px;"
                        >
                          {{ host }}
                        </a-tag>
                      </span>
                      <span v-else>{{ item.meetingHost }}</span>
                    </a-descriptions-item>
                    <a-descriptions-item label="参会专家">
                      <span v-if="item.experts && item.experts.length > 0">
                        <a-tag 
                          v-for="expert in item.experts" 
                          :key="expert" 
                          color="green" 
                          style="margin-right: 4px;"
                        >
                          {{ expert }}
                        </a-tag>
                      </span>
                    </a-descriptions-item>
                    <a-descriptions-item label="会议资料" v-if="item.meetingMaterials && item.meetingMaterials.length > 0">
                      <div class="meeting-materials-display">
                        <a-tag 
                          v-for="(material, index) in item.meetingMaterials" 
                          :key="index"
                          color="orange"
                          style="margin: 2px 4px 2px 0; cursor: pointer;"
                          @click="downloadMaterial(material)"
                        >
                          <FileOutlined style="margin-right: 4px;" />
                          {{ material.name }}
                        </a-tag>
                      </div>
                    </a-descriptions-item>
                    <a-descriptions-item label="会议说明" :span="item.meetingMaterials && item.meetingMaterials.length > 0 ? 1 : 2">
                      {{ item.meetingDescription }}
                    </a-descriptions-item>
                  </a-descriptions>
                </div>
              </div>

              <div class="item-actions">
                <a-space>
                  <a-button
                    v-if="item.meetingStatus === 'scheduled'"
                    type="primary"
                    @click="startMeeting(item)"
                  >
                    <PlayCircleOutlined />
                    开始会议
                  </a-button>
                  <a-button
                    v-if="item.meetingStatus === 'in_progress'"
                    type="primary"
                    @click="inputConclusion(item)"
                  >
                    <EditOutlined />
                    录入结论
                  </a-button>
                  <a-button 
                    v-if="item.meetingStatus === 'scheduled'"
                    type="default"
                    @click="sendNotification(item)"
                    :loading="item.notifyLoading"
                  >
                    <MessageOutlined />
                    一键通知
                  </a-button>
                  <a-button 
                    :disabled="item.meetingStatus !== 'scheduled'"
                    @click="editMeeting(item)"
                  >
                    <EditOutlined />
                    编辑会议
                  </a-button>
                  <a-button type="link" @click="viewMeetingDetail(item)">
                    查看详情
                  </a-button>
                  <a-button 
                    type="link" 
                    danger 
                    @click="deleteMeeting(item)"
                  >
                    删除
                  </a-button>
                </a-space>
              </div>
            </div>
          </div>
        </a-tab-pane>

        <a-tab-pane key="conclusion" tab="结论管理">
          <!-- 结论管理列表 -->
          <div class="conclusion-list">
            <div
              v-for="item in conclusionList"
              :key="item.id"
              class="conclusion-item"
            >
              <div class="item-header">
                <div class="project-info">
                  <h4 class="project-name">{{ item.projectName }}</h4>
                  <div class="project-meta">
                    <span class="project-code">{{ item.projectCode }}</span>
                    <span class="meeting-time">会议时间：{{ item.meetingTime }}</span>
                    <span class="conclusion-time">结论时间：{{ item.conclusionTime }}</span>
                  </div>
                </div>
                <div class="item-status">
                  <a-tag :color="getConclusionColor(item.conclusion)" size="large">
                    {{ getConclusionText(item.conclusion) }}
                  </a-tag>
                </div>
              </div>

              <div class="item-content">
                <div class="conclusion-details">
                  <div class="conclusion-section">
                    <div class="section-title">验收结论</div>
                    <div class="section-content">
                      <div class="conclusion-result">
                        <span class="result-label">结论：</span>
                        <span class="result-value">{{ getConclusionText(item.conclusion) }}</span>
                        <span class="result-score">评分：{{ item.score }}分</span>
                      </div>
                      <div class="conclusion-description">{{ item.conclusionDescription }}</div>
                    </div>
                  </div>

                  <div v-if="item.requirements" class="conclusion-section">
                    <div class="section-title">整改要求</div>
                    <div class="section-content">{{ item.requirements }}</div>
                  </div>

                  <!-- 结论相关文件展示 -->
                  <div v-if="item.conclusionFiles && item.conclusionFiles.length > 0" class="conclusion-section">
                    <div class="section-title">结论相关文件</div>
                    <div class="section-content">
                      <div class="conclusion-files-display">
                        <a-tag 
                          v-for="(file, index) in item.conclusionFiles" 
                          :key="index"
                          color="purple"
                          style="margin: 2px 4px 2px 0; cursor: pointer;"
                          @click="downloadConclusionFile(file)"
                        >
                          <FileOutlined style="margin-right: 4px;" />
                          {{ file.name }}
                        </a-tag>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="item-actions">
                <a-space>
                  <a-button @click="editConclusion(item)">
                    <EditOutlined />
                    编辑结论
                  </a-button>
                  <a-button @click="exportConclusion(item)">
                    <ExportOutlined />
                    导出结论
                  </a-button>
                  <a-button type="link" @click="viewConclusionDetail(item)">
                    查看详情
                  </a-button>
                </a-space>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 安排会议弹窗 -->
    <a-modal
      v-model:open="scheduleModalVisible"
      title="安排验收会议"
      width="700px"
      @ok="handleScheduleSubmit"
      @cancel="handleScheduleCancel"
    >
      <div v-if="selectedProject" class="schedule-modal">
        <a-form :model="scheduleForm" layout="vertical">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="会议时间" required>
                <a-date-picker
                  v-model:value="scheduleForm.datetime"
                  show-time
                  placeholder="选择会议时间"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="会议地点" required>
                <a-input
                  v-model:value="scheduleForm.location"
                  placeholder="请输入会议地点"
                />
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-form-item label="会议形式" required>
            <a-radio-group v-model:value="scheduleForm.type">
              <a-radio value="offline">现场会议</a-radio>
              <a-radio value="online">线上会议</a-radio>
              <a-radio value="hybrid">混合会议</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="会议主持人" required>
            <a-select
              v-model:value="scheduleForm.hosts"
              mode="tags"
              placeholder="选择或输入主持人（可选择多个或手动输入）"
              style="width: 100%"
              :options="hostOptions"
              :filter-option="filterHostOption"
            >
              <template #tagRender="{ label, onClose }">
                <a-tag 
                  color="blue" 
                  closable 
                  @close="onClose"
                  style="margin-right: 4px; margin-bottom: 4px;"
                >
                  {{ label }}
                </a-tag>
              </template>
            </a-select>
            <div class="form-tip">可从下拉列表选择或直接输入姓名，支持多个主持人</div>
          </a-form-item>

          <a-form-item label="参会专家" required>
            <a-select
              v-model:value="scheduleForm.experts"
              mode="tags"
              placeholder="选择或输入参会专家（可选择多个或手动输入）"
              style="width: 100%"
              :options="expertOptions"
              :filter-option="filterExpertOption"
            >
              <template #tagRender="{ label, onClose }">
                <a-tag 
                  color="green" 
                  closable 
                  @close="onClose"
                  style="margin-right: 4px; margin-bottom: 4px;"
                >
                  {{ label }}
                </a-tag>
              </template>
            </a-select>
            <div class="form-tip">可从下拉列表选择或直接输入专家姓名，支持多个专家</div>
          </a-form-item>

          <a-form-item label="会议资料">
            <div class="meeting-materials">
              <a-upload
                v-model:file-list="scheduleForm.materials"
                :before-upload="beforeUploadMaterial"
                :on-remove="removeMaterial"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
              >
                <a-button>
                  <UploadOutlined />
                  上传会议资料
                </a-button>
              </a-upload>
              <div class="upload-tip">
                支持上传PDF、Word、PPT、Excel、压缩包等格式，单个文件不超过50MB
              </div>
              
              <!-- 资料列表展示 -->
              <div v-if="scheduleForm.materials.length > 0" class="materials-list">
                <div 
                  v-for="(file, index) in scheduleForm.materials" 
                  :key="index"
                  class="material-item"
                >
                  <FileOutlined class="file-icon" />
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                  <a-button 
                    type="link" 
                    danger 
                    size="small"
                    @click="removeMaterialByIndex(index)"
                  >
                    删除
                  </a-button>
                </div>
              </div>
            </div>
          </a-form-item>

          <a-form-item label="会议说明">
            <a-textarea
              v-model:value="scheduleForm.description"
              placeholder="请填写会议说明..."
              :rows="3"
              show-count
              :maxlength="200"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 编辑会议弹窗 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑会议安排"
      width="700px"
      @ok="handleEditSubmit"
      @cancel="handleEditCancel"
    >
      <div v-if="selectedEditMeeting" class="edit-modal">
        <a-form :model="editForm" layout="vertical">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="会议时间" required>
                <a-date-picker
                  v-model:value="editForm.datetime"
                  show-time
                  placeholder="选择会议时间"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="会议地点" required>
                <a-input
                  v-model:value="editForm.location"
                  placeholder="请输入会议地点"
                />
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-form-item label="会议形式" required>
            <a-radio-group v-model:value="editForm.type">
              <a-radio value="offline">现场会议</a-radio>
              <a-radio value="online">线上会议</a-radio>
              <a-radio value="hybrid">混合会议</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="会议主持人" required>
            <a-select
              v-model:value="editForm.hosts"
              mode="tags"
              placeholder="选择或输入主持人（可选择多个或手动输入）"
              style="width: 100%"
              :options="hostOptions"
              :filter-option="filterHostOption"
            >
              <template #tagRender="{ label, onClose }">
                <a-tag 
                  color="blue" 
                  closable 
                  @close="onClose"
                  style="margin-right: 4px; margin-bottom: 4px;"
                >
                  {{ label }}
                </a-tag>
              </template>
            </a-select>
          </a-form-item>

          <a-form-item label="参会专家" required>
            <a-select
              v-model:value="editForm.experts"
              mode="tags"
              placeholder="选择或输入参会专家（可选择多个或手动输入）"
              style="width: 100%"
              :options="expertOptions"
              :filter-option="filterExpertOption"
            >
              <template #tagRender="{ label, onClose }">
                <a-tag 
                  color="green" 
                  closable 
                  @close="onClose"
                  style="margin-right: 4px; margin-bottom: 4px;"
                >
                  {{ label }}
                </a-tag>
              </template>
            </a-select>
          </a-form-item>

          <a-form-item label="会议资料">
            <div class="meeting-materials">
              <a-upload
                v-model:file-list="editForm.materials"
                :before-upload="beforeUploadEditMaterial"
                :on-remove="removeEditMaterial"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
              >
                <a-button>
                  <UploadOutlined />
                  上传会议资料
                </a-button>
              </a-upload>
              
              <!-- 资料列表展示 -->
              <div v-if="editForm.materials.length > 0" class="materials-list">
                <div 
                  v-for="(file, index) in editForm.materials" 
                  :key="index"
                  class="material-item"
                >
                  <FileOutlined class="file-icon" />
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                  <a-button 
                    type="link" 
                    danger 
                    size="small"
                    @click="removeEditMaterialByIndex(index)"
                  >
                    删除
                  </a-button>
                </div>
              </div>
            </div>
          </a-form-item>

          <a-form-item label="会议说明">
            <a-textarea
              v-model:value="editForm.description"
              placeholder="请填写会议说明..."
              :rows="3"
              show-count
              :maxlength="200"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 录入结论弹窗 -->
    <a-modal
      v-model:open="conclusionModalVisible"
      title="录入验收结论"
      width="800px"
      @ok="handleConclusionSubmit"
      @cancel="handleConclusionCancel"
    >
      <div v-if="selectedMeeting" class="conclusion-modal">
        <div class="project-meeting-info">
          <h4>会议信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="项目名称" :span="2">
              {{ selectedMeeting.projectName }}
            </a-descriptions-item>
            <a-descriptions-item label="会议时间">
              {{ selectedMeeting.meetingTime }}
            </a-descriptions-item>
            <a-descriptions-item label="会议地点">
              {{ selectedMeeting.meetingLocation }}
            </a-descriptions-item>
            <a-descriptions-item label="会议形式" v-if="selectedMeeting.meetingType">
              {{ selectedMeeting.meetingType === 'offline' ? '现场会议' : selectedMeeting.meetingType === 'online' ? '线上会议' : '混合会议' }}
            </a-descriptions-item>
            <a-descriptions-item label="会议说明" :span="2" v-if="selectedMeeting.meetingDescription">
              {{ selectedMeeting.meetingDescription }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <a-form :model="conclusionForm" layout="vertical">
          <a-form-item label="验收结论" required>
            <a-radio-group v-model:value="conclusionForm.conclusion">
              <a-radio value="passed">验收通过</a-radio>
              <a-radio value="conditional_passed">有条件通过</a-radio>
              <a-radio value="failed">验收不通过</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="验收评分">
            <a-input-number
              v-model:value="conclusionForm.score"
              :min="0"
              :max="100"
              placeholder="请输入评分"
              style="width: 200px"
            />
            <span style="margin-left: 8px">分</span>
          </a-form-item>

          <a-form-item label="结论说明" required>
            <a-textarea
              v-model:value="conclusionForm.description"
              placeholder="请详细说明验收结论..."
              :rows="4"
              show-count
              :maxlength="500"
            />
          </a-form-item>

          <a-form-item label="整改要求" v-if="conclusionForm.conclusion !== 'passed'">
            <a-textarea
              v-model:value="conclusionForm.requirements"
              placeholder="请填写整改要求..."
              :rows="3"
              show-count
              :maxlength="300"
            />
          </a-form-item>

          <a-form-item label="结论相关文件">
            <div class="conclusion-files">
              <a-upload
                v-model:file-list="conclusionForm.conclusionFiles"
                :before-upload="beforeUploadConclusionFile"
                :on-remove="removeConclusionFile"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx"
              >
                <a-button>
                  <UploadOutlined />
                  上传结论文件
                </a-button>
              </a-upload>
              
              <!-- 文件列表展示 -->
              <div v-if="conclusionForm.conclusionFiles.length > 0" class="files-list">
                <div 
                  v-for="(file, index) in conclusionForm.conclusionFiles" 
                :key="index"
                  class="file-item"
                >
                  <FileOutlined class="file-icon" />
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                    <a-button
                      type="link"
                      danger
                    size="small"
                    @click="removeConclusionFileByIndex(index)"
                    >
                      删除
                    </a-button>
                </div>
              </div>
              <div class="upload-tip">
                <small style="color: #999;">
                  支持上传 PDF、Word、Excel 文件，单个文件大小不超过 20MB
                </small>
              </div>
            </div>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 项目详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="项目详情"
      width="800px"
      :footer="null"
      @cancel="handleDetailCancel"
    >
      <div v-if="selectedProject" class="detail-modal">
        <!-- 项目基本信息 -->
        <div class="detail-section">
          <h4>项目基本信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="项目名称" :span="2">
              {{ selectedProject.projectName }}
            </a-descriptions-item>
            <a-descriptions-item label="项目编号">
              {{ selectedProject.projectCode }}
            </a-descriptions-item>
            <a-descriptions-item label="项目负责人">
              {{ selectedProject.projectLeader }}
            </a-descriptions-item>
            <a-descriptions-item label="项目周期">
              {{ selectedProject.projectDuration }}
            </a-descriptions-item>
            <a-descriptions-item label="项目预算">
              {{ selectedProject.projectBudget }}万元
            </a-descriptions-item>
            <a-descriptions-item label="提交时间">
              {{ selectedProject.submitTime }}
            </a-descriptions-item>
            <a-descriptions-item label="材料状态">
              <a-tag :color="selectedProject.materialStatus === 'approved' ? 'green' : 'orange'">
                {{ getMaterialStatusText(selectedProject.materialStatus) }}
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 材料审核情况 -->
        <div class="detail-section">
          <h4>材料审核情况</h4>
          <div class="material-summary">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-statistic 
                  title="必需材料通过" 
                  :value="selectedProject.requiredMaterials" 
                  :suffix="`/ ${selectedProject.totalRequired}`"
                  :value-style="{ color: '#52c41a' }"
                />
              </a-col>
              <a-col :span="12">
                <a-statistic 
                  title="可选材料提交" 
                  :value="selectedProject.optionalMaterials" 
                  suffix="项"
                  :value-style="{ color: '#1890ff' }"
                />
                  </a-col>
                </a-row>
              </div>
        </div>

        <!-- 模拟验收材料列表 -->
        <div class="detail-section">
          <h4>验收材料</h4>
          <div class="material-list">
            <div class="material-item-detail">
              <div class="material-info">
                <div class="material-name">
                  <FileOutlined />
                  项目总结报告.pdf
                </div>
                <div class="material-meta">
                  <span class="material-type">必需材料</span>
                  <a-tag color="green" size="small">已通过</a-tag>
                </div>
              </div>
              <div class="material-actions">
                <a-button type="link" size="small">预览</a-button>
                <a-button type="link" size="small">下载</a-button>
              </div>
            </div>
            <div class="material-item-detail">
              <div class="material-info">
                <div class="material-name">
                  <FileOutlined />
                  技术文档.docx
                </div>
                <div class="material-meta">
                  <span class="material-type">必需材料</span>
                  <a-tag color="green" size="small">已通过</a-tag>
                </div>
              </div>
              <div class="material-actions">
                <a-button type="link" size="small">预览</a-button>
                <a-button type="link" size="small">下载</a-button>
              </div>
            </div>
            <div class="material-item-detail">
              <div class="material-info">
                <div class="material-name">
                  <FileOutlined />
                  演示视频.mp4
                </div>
                <div class="material-meta">
                  <span class="material-type">可选材料</span>
                  <a-tag color="blue" size="small">已提交</a-tag>
                </div>
              </div>
              <div class="material-actions">
                <a-button type="link" size="small">预览</a-button>
                <a-button type="link" size="small">下载</a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 短信通知弹窗 -->
    <a-modal
      v-model:open="notifyModalVisible"
      title="发送会议通知"
      width="600px"
      @ok="handleSendNotification"
      @cancel="handleNotifyCancel"
      :confirm-loading="sendingNotification"
    >
      <div v-if="selectedMeetingForNotify" class="notify-modal">
        <div class="meeting-summary">
          <h4>会议信息</h4>
          <a-descriptions :column="1" size="small" bordered>
            <a-descriptions-item label="项目名称">{{ selectedMeetingForNotify.projectName }}</a-descriptions-item>
            <a-descriptions-item label="会议时间">{{ selectedMeetingForNotify.meetingTime }}</a-descriptions-item>
            <a-descriptions-item label="会议地点">{{ selectedMeetingForNotify.meetingLocation }}</a-descriptions-item>
            <a-descriptions-item label="会议形式">
              <a-tag :color="getMeetingTypeColor(selectedMeetingForNotify.meetingType)">
                {{ getMeetingTypeText(selectedMeetingForNotify.meetingType) }}
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <a-form :model="notifyForm" layout="vertical" style="margin-top: 20px;">
          <a-form-item label="通知方式" required>
            <a-checkbox-group v-model:value="notifyForm.methods">
              <a-checkbox value="sms">短信通知</a-checkbox>
              <a-checkbox value="email" disabled>邮件通知（暂未开放）</a-checkbox>
              <a-checkbox value="wechat" disabled>微信通知（暂未开放）</a-checkbox>
            </a-checkbox-group>
          </a-form-item>

          <a-form-item label="通知对象" required>
            <div class="notify-targets">
              <div class="target-group">
                <div class="group-title">会议主持人</div>
                <div class="target-list">
                  <a-checkbox 
                    v-for="host in selectedMeetingForNotify.meetingHosts" 
                    :key="host"
                    :value="host"
                    v-model:checked="notifyForm.selectedHosts[host]"
                    style="display: block; margin-bottom: 8px;"
                  >
                    {{ host }}
                  </a-checkbox>
                </div>
              </div>
              
              <div class="target-group">
                <div class="group-title">参会专家</div>
                <div class="target-list">
                  <a-checkbox 
                    v-for="expert in selectedMeetingForNotify.experts" 
                    :key="expert"
                    :value="expert"
                    v-model:checked="notifyForm.selectedExperts[expert]"
                    style="display: block; margin-bottom: 8px;"
                  >
                    {{ expert }}
                  </a-checkbox>
                </div>
              </div>
            </div>
            
            <div class="select-all-actions" style="margin-top: 12px;">
              <a-button size="small" @click="selectAllTargets">全选</a-button>
              <a-button size="small" @click="clearAllTargets" style="margin-left: 8px;">清空</a-button>
            </div>
          </a-form-item>

          <a-form-item label="通知内容">
            <a-textarea
              v-model:value="notifyForm.content"
              :rows="4"
              placeholder="系统将自动生成通知内容，您也可以自定义修改..."
            />
            <div class="content-tip">
              系统会自动包含会议时间、地点等基本信息
            </div>
          </a-form-item>

          <a-form-item label="提醒设置">
            <div class="reminder-settings">
              <div class="reminder-option">
                <a-checkbox 
                  v-model:checked="notifyForm.sendImmediately"
                  style="margin-bottom: 12px;"
                >
                  立即发送
                </a-checkbox>
              </div>
              
              <div class="reminder-option">
                <a-checkbox 
                  v-model:checked="notifyForm.enableReminder"
                  style="margin-bottom: 8px;"
                >
                  会议前提醒
                </a-checkbox>
                
                <div v-if="notifyForm.enableReminder" class="reminder-time-setting">
                  <a-input-number
                    v-model:value="notifyForm.reminderValue"
                    :min="1"
                    :max="365"
                    placeholder="输入数值"
                    style="width: 120px; margin-right: 8px;"
                  />
                  <a-select
                    v-model:value="notifyForm.reminderUnit"
                    style="width: 80px;"
                    placeholder="单位"
                  >
                    <a-select-option value="hours">小时</a-select-option>
                    <a-select-option value="days">天</a-select-option>
                  </a-select>
                  <span style="margin-left: 8px; color: #8c8c8c; font-size: 12px;">
                    提醒
                  </span>
                </div>
              </div>
            </div>
          </a-form-item>
        </a-form>

        <div v-if="selectedMeetingForNotify.lastNotifyTime" class="last-notify-info">
          <a-alert
            type="info"
            :message="`上次通知时间：${selectedMeetingForNotify.lastNotifyTime}`"
            show-icon
            style="margin-top: 16px;"
          />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
/**
 * 会议结论管理页面 - 管理角色
 * 功能：会议安排、结论录入、流程管理、状态跟踪
 */
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import {
  ScheduleOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  SearchOutlined,
  PlayCircleOutlined,
  EditOutlined,
  ExportOutlined,
  PlusOutlined,
  UploadOutlined,
  FileOutlined,
  MessageOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
// 导入PageContainer组件
import PageContainer from '@/components/PageContainer.vue'

// 统计数据
const stats = ref({
  pendingSchedule: 5,
  scheduled: 8,
  completed: 12,
  pendingConclusion: 3
})

// 筛选条件
const filters = ref({
  status: undefined,
  meetingDateRange: undefined,
  keyword: ''
})

// 活动标签页
const activeTab = ref('schedule')

// 待安排会议列表
const pendingScheduleList = ref([
  {
    id: 1,
    projectName: '智慧城市大数据平台建设项目',
    projectCode: 'PROJ-2024-001',
    projectLeader: '张三',
    projectDuration: '12个月',
    projectBudget: 500,
    materialStatus: 'approved',
    submitTime: '2024-01-15',
    requiredMaterials: 4,
    totalRequired: 4,
    optionalMaterials: 2
  }
])

// 已安排会议列表
const scheduledMeetingList = ref([
  {
    id: 2,
    projectName: '区块链供应链金融平台',
    projectCode: 'PROJ-2024-002',
    meetingTime: '2024-01-25 14:00',
    meetingLocation: '会议室A-201',
    meetingType: 'offline',
    meetingHost: '李主任、王经理', // 兼容旧格式
    meetingHosts: ['李主任 - 技术主任', '王经理 - 项目经理'], // 新格式
    meetingStatus: 'scheduled',
    experts: ['张教授 - 高级工程师', '李博士 - 技术专家', '王专家 - 项目管理专家'],
    meetingMaterials: [], // 会议资料
    meetingDescription: '项目验收会议，请准时参加',
    notifyLoading: false, // 通知发送加载状态
    lastNotifyTime: null // 最后通知时间
  }
])

// 结论列表
const conclusionList = ref([
  {
    id: 3,
    projectName: 'AI智能客服系统',
    projectCode: 'PROJ-2024-003',
    meetingTime: '2024-01-20 09:00',
    conclusionTime: '2024-01-20 11:30',
    conclusion: 'passed',
    score: 88,
    conclusionDescription: '项目完成质量良好，各项指标达到预期要求，同意验收通过。',
    requirements: null,
    conclusionFiles: [
      {
        id: 1,
        name: '验收结论报告.pdf',
        size: 1024 * 1024 * 2, // 2MB
        type: 'application/pdf'
      },
      {
        id: 2,
        name: '验收评分表.xlsx',
        size: 1024 * 512, // 512KB
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    ]
  }
])

// 主持人列表
const hostList = ref([
  { id: 1, name: '李主任', title: '技术主任' },
  { id: 2, name: '王经理', title: '项目经理' },
  { id: 3, name: '张总监', title: '技术总监' }
])

// 专家列表
const expertList = ref([
  { id: 1, name: '张教授', title: '高级工程师' },
  { id: 2, name: '李博士', title: '技术专家' },
  { id: 3, name: '王专家', title: '项目管理专家' },
  { id: 4, name: '赵顾问', title: '行业顾问' }
])

// 弹窗状态
const scheduleModalVisible = ref(false)
const editModalVisible = ref(false)
const conclusionModalVisible = ref(false)
const detailModalVisible = ref(false)
const notifyModalVisible = ref(false)
const selectedProject = ref(null)
const selectedMeeting = ref(null)
const selectedEditMeeting = ref(null)
const selectedMeetingForNotify = ref(null)
const sendingNotification = ref(false)

// 表单数据
const scheduleForm = ref({
  datetime: undefined,
  location: '',
  type: 'offline',
  hosts: [], // 改为数组，支持多个主持人
  experts: [], // 支持手动输入的专家
  materials: [], // 会议资料文件列表
  description: ''
})

const editForm = ref({
  datetime: undefined,
  location: '',
  type: 'offline',
  hosts: [], 
  experts: [],
  materials: [], 
  description: ''
})

const conclusionForm = ref({
  conclusion: 'passed',
  score: 85,
  description: '',
  requirements: '',
  conclusionFiles: [] // 结论相关文件
})

const notifyForm = ref({
  methods: ['sms'], // 通知方式
  selectedHosts: {}, // 选中的主持人
  selectedExperts: {}, // 选中的专家
  content: '', // 通知内容
  sendImmediately: true, // 立即发送
  enableReminder: false, // 启用提醒
  reminderValue: 1, // 提醒数值
  reminderUnit: 'hours' // 提醒单位（hours/days）
})

// 计算属性 - 转换为选项格式
const hostOptions = computed(() => {
  return hostList.value.map(host => ({
    label: `${host.name} - ${host.title}`,
    value: `${host.name} - ${host.title}`
  }))
})

const expertOptions = computed(() => {
  return expertList.value.map(expert => ({
    label: `${expert.name} - ${expert.title}`,
    value: `${expert.name} - ${expert.title}`
  }))
})

// 过滤方法
const filterHostOption = (input, option) => {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

const filterExpertOption = (input, option) => {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

// 文件上传相关方法
const beforeUploadMaterial = (file) => {
  // 检查文件大小（50MB限制）
  const isLt50M = file.size / 1024 / 1024 < 50
  if (!isLt50M) {
    message.error('文件大小不能超过50MB!')
    return false
  }
  
  // 检查文件类型
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-rar-compressed'
  ]
  
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx|zip|rar)$/i)) {
    message.error('只支持PDF、Word、PPT、Excel、压缩包格式!')
    return false
  }
  
  // 将文件添加到材料列表
  scheduleForm.value.materials.push(file)
  message.success(`文件 ${file.name} 添加成功`)
  
  return false // 阻止自动上传
}

const removeMaterial = (file) => {
  const index = scheduleForm.value.materials.findIndex(item => item.uid === file.uid)
  if (index > -1) {
    scheduleForm.value.materials.splice(index, 1)
  }
}

const removeMaterialByIndex = (index) => {
  scheduleForm.value.materials.splice(index, 1)
  message.success('文件删除成功')
}

// 编辑会议的文件上传方法
const beforeUploadEditMaterial = (file) => {
  const isLt50M = file.size / 1024 / 1024 < 50
  if (!isLt50M) {
    message.error('文件大小不能超过50MB!')
    return false
  }
  
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-rar-compressed'
  ]
  
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx|zip|rar)$/i)) {
    message.error('只支持PDF、Word、PPT、Excel、压缩包格式!')
    return false
  }
  
  editForm.value.materials.push(file)
  message.success(`文件 ${file.name} 添加成功`)
  
  return false
}

const removeEditMaterial = (file) => {
  const index = editForm.value.materials.findIndex(item => item.uid === file.uid)
  if (index > -1) {
    editForm.value.materials.splice(index, 1)
  }
}

const removeEditMaterialByIndex = (index) => {
  editForm.value.materials.splice(index, 1)
  message.success('文件删除成功')
}

// 结论文件上传方法
const beforeUploadConclusionFile = (file) => {
  const isLt20M = file.size / 1024 / 1024 < 20
  if (!isLt20M) {
    message.error('文件大小不能超过20MB!')
    return false
  }
  
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|xls|xlsx)$/i)) {
    message.error('只支持PDF、Word、Excel格式!')
    return false
  }
  
  conclusionForm.value.conclusionFiles.push(file)
  message.success(`文件 ${file.name} 添加成功`)
  
  return false
}

const removeConclusionFile = (file) => {
  const index = conclusionForm.value.conclusionFiles.findIndex(item => item.uid === file.uid)
  if (index > -1) {
    conclusionForm.value.conclusionFiles.splice(index, 1)
  }
}

const removeConclusionFileByIndex = (index) => {
  conclusionForm.value.conclusionFiles.splice(index, 1)
  message.success('文件删除成功')
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 状态相关方法
const getMaterialStatusText = (status) => {
  const textMap = {
    approved: '已通过',
    rejected: '已驳回',
    pending: '待审核'
  }
  return textMap[status] || '未知'
}

const getMeetingStatusColor = (status) => {
  const colorMap = {
    scheduled: 'blue',
    in_progress: 'orange',
    completed: 'green'
  }
  return colorMap[status] || 'default'
}

const getMeetingStatusText = (status) => {
  const textMap = {
    scheduled: '已安排',
    in_progress: '进行中',
    completed: '已完成'
  }
  return textMap[status] || '未知'
}

const getMeetingTypeText = (type) => {
  const textMap = {
    offline: '现场会议',
    online: '线上会议',
    hybrid: '混合会议'
  }
  return textMap[type] || '未知'
}

const getMeetingTypeColor = (type) => {
  const colorMap = {
    offline: 'blue',
    online: 'green',
    hybrid: 'orange'
  }
  return colorMap[type] || 'default'
}

const getConclusionColor = (conclusion) => {
  const colorMap = {
    passed: 'green',
    conditional_passed: 'orange',
    failed: 'red'
  }
  return colorMap[conclusion] || 'default'
}

const getConclusionText = (conclusion) => {
  const textMap = {
    passed: '验收通过',
    conditional_passed: '有条件通过',
    failed: '验收不通过'
  }
  return textMap[conclusion] || '未知'
}

// 事件处理方法
const scheduleBatchMeeting = () => {
  if (pendingScheduleList.value.length === 0) {
    message.warning('暂无待安排会议的项目')
    return
  }
  
  message.info(`开始批量安排会议，共 ${pendingScheduleList.value.length} 个项目`)
  
  // 实际项目中可以打开批量安排弹窗
  // batchScheduleModalVisible.value = true
}

const handleFilter = () => {
  // 筛选逻辑
}

const resetFilters = () => {
  filters.value = {
    status: undefined,
    meetingDateRange: undefined,
    keyword: ''
  }
}

const handleTabChange = (key) => {
  activeTab.value = key
}

const scheduleMeeting = (item) => {
  selectedProject.value = item
  scheduleForm.value = {
    datetime: undefined,
    location: '',
    type: 'offline',
    hosts: [], // 重置为空数组
    experts: [], // 重置为空数组
    materials: [], // 重置为空数组
    description: ''
  }
  scheduleModalVisible.value = true
}

const viewMaterials = (item) => {
  message.info(`查看材料：${item.projectName}`)
}

const viewProjectDetail = (item) => {
  // 显示项目详情，包括验收材料的预览和下载
  selectedProject.value = item
  detailModalVisible.value = true
}

const startMeeting = (item) => {
  item.meetingStatus = 'in_progress'
  message.success(`开始会议：${item.projectName}`)
}

const editMeeting = (item) => {
  selectedEditMeeting.value = item
  editForm.value = {
    datetime: item.meetingTime ? dayjs(item.meetingTime) : undefined,
    location: item.meetingLocation || '',
    type: item.meetingType || 'offline',
    hosts: item.meetingHosts || (item.meetingHost ? [item.meetingHost] : []),
    experts: item.experts || [],
    materials: item.meetingMaterials || [],
    description: item.meetingDescription || ''
  }
  editModalVisible.value = true
}

const deleteMeeting = (item) => {
  // 显示确认删除对话框
  const modal = Modal.confirm({
    title: '确认删除',
    content: `确定要删除项目"${item.projectName}"的会议安排吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk() {
      // 从已安排会议列表中删除
      const index = scheduledMeetingList.value.findIndex(meeting => meeting.id === item.id)
      if (index > -1) {
        scheduledMeetingList.value.splice(index, 1)
        // 将项目重新添加到待安排会议列表
        pendingScheduleList.value.push({
          id: item.id,
          projectName: item.projectName,
          projectCode: item.projectCode,
          projectLeader: '张三', // 这里应该从原始数据获取
          projectDuration: '12个月',
          projectBudget: 500,
          materialStatus: 'approved',
          submitTime: '2024-01-15',
          requiredMaterials: 4,
          totalRequired: 4,
          optionalMaterials: 2
        })
        message.success('会议删除成功')
      }
    }
  })
}

const inputConclusion = (item) => {
  selectedMeeting.value = item
  conclusionForm.value = {
    conclusion: 'passed',
    score: 85,
    description: '',
    requirements: '',
    conclusionFiles: []
  }
  conclusionModalVisible.value = true
}

// 删除重复的editMeeting方法

const viewMeetingDetail = (item) => {
  // 显示会议详情，包括会议信息、参会人员、会议资料等
  selectedMeeting.value = item
  
  // 这里应该打开会议详情弹窗
  message.success(`正在查看会议详情：${item.projectName}`)
  
  // 实际项目中可以这样实现：
  // meetingDetailModalVisible.value = true
}

const editConclusion = (item) => {
  // 编辑已录入的结论
  selectedMeeting.value = item
  conclusionForm.value = {
    conclusion: item.conclusion || 'passed',
    score: item.score || 85,
    description: item.conclusionDescription || '',
    requirements: item.requirements || '',
    conclusionFiles: item.conclusionFiles || []
  }
  conclusionModalVisible.value = true
}

const exportConclusion = (item) => {
  // 导出验收结论文档
  message.success(`正在导出验收结论：${item.projectName}`)
  
  // 实际项目中这里应该调用导出接口
  // exportAPI.exportConclusion(item.id)
}

const viewConclusionDetail = (item) => {
  // 查看结论详情
  selectedMeeting.value = item
  message.success(`正在查看结论详情：${item.projectName}`)
  
  // 实际项目中可以打开详情弹窗
  // conclusionDetailModalVisible.value = true
}

// 会议资料下载方法
const downloadMaterial = (material) => {
  // 实际项目中这里应该调用下载接口
  message.success(`下载会议资料：${material.name}`)
  
  // 模拟下载（实际应该是从服务器下载）
  const url = URL.createObjectURL(material)
  const link = document.createElement('a')
  link.href = url
  link.download = material.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 结论文件下载方法
const downloadConclusionFile = (file) => {
  message.success(`下载结论文件：${file.name}`)
  
  // 实际项目中这里应该调用下载接口
  // downloadAPI.downloadConclusionFile(file.id)
}

// 一键通知方法
const sendNotification = (meeting) => {
  selectedMeetingForNotify.value = meeting
  
  // 初始化通知表单
  resetNotifyForm()
  
  // 生成默认通知内容
  generateDefaultNotifyContent()
  
  notifyModalVisible.value = true
}

// 重置通知表单
const resetNotifyForm = () => {
  notifyForm.value = {
    methods: ['sms'],
    selectedHosts: {},
    selectedExperts: {},
    content: '',
    sendImmediately: true,
    enableReminder: false,
    reminderValue: 1,
    reminderUnit: 'hours'
  }
  
  // 默认选中所有参会人员
  if (selectedMeetingForNotify.value) {
    // 选中所有主持人
    selectedMeetingForNotify.value.meetingHosts.forEach(host => {
      notifyForm.value.selectedHosts[host] = true
    })
    
    // 选中所有专家
    selectedMeetingForNotify.value.experts.forEach(expert => {
      notifyForm.value.selectedExperts[expert] = true
    })
  }
}

// 生成默认通知内容
const generateDefaultNotifyContent = () => {
  if (!selectedMeetingForNotify.value) return
  
  const meeting = selectedMeetingForNotify.value
  const typeText = getMeetingTypeText(meeting.meetingType)
  
  notifyForm.value.content = `【会议通知】
项目：${meeting.projectName}（${meeting.projectCode}）
时间：${meeting.meetingTime}
地点：${meeting.meetingLocation}
形式：${typeText}
说明：${meeting.meetingDescription || '请准时参加'}

如有疑问，请及时联系会议组织方。`
}

// 全选通知对象
const selectAllTargets = () => {
  if (selectedMeetingForNotify.value) {
    // 选中所有主持人
    selectedMeetingForNotify.value.meetingHosts.forEach(host => {
      notifyForm.value.selectedHosts[host] = true
    })
    
    // 选中所有专家
    selectedMeetingForNotify.value.experts.forEach(expert => {
      notifyForm.value.selectedExperts[expert] = true
    })
  }
}

// 清空通知对象
const clearAllTargets = () => {
  notifyForm.value.selectedHosts = {}
  notifyForm.value.selectedExperts = {}
}

// 发送通知
const handleSendNotification = async () => {
  // 验证通知方式
  if (!notifyForm.value.methods || notifyForm.value.methods.length === 0) {
    message.error('请选择通知方式')
    return
  }
  
  // 验证通知对象
  const selectedHosts = Object.keys(notifyForm.value.selectedHosts).filter(key => notifyForm.value.selectedHosts[key])
  const selectedExperts = Object.keys(notifyForm.value.selectedExperts).filter(key => notifyForm.value.selectedExperts[key])
  
  if (selectedHosts.length === 0 && selectedExperts.length === 0) {
    message.error('请选择至少一个通知对象')
    return
  }
  
  // 验证通知内容
  if (!notifyForm.value.content.trim()) {
    message.error('请填写通知内容')
    return
  }
  
  // 验证提醒设置
  if (!notifyForm.value.sendImmediately && !notifyForm.value.enableReminder) {
    message.error('请至少选择一种发送方式')
    return
  }
  
  if (notifyForm.value.enableReminder) {
    if (!notifyForm.value.reminderValue || notifyForm.value.reminderValue < 1) {
      message.error('请输入有效的提醒时间')
      return
    }
    if (!notifyForm.value.reminderUnit) {
      message.error('请选择提醒时间单位')
      return
    }
  }
  
  sendingNotification.value = true
  
  try {
    // 模拟发送短信API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 更新最后通知时间
    if (selectedMeetingForNotify.value) {
      selectedMeetingForNotify.value.lastNotifyTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
    
    const totalRecipients = selectedHosts.length + selectedExperts.length
    let successMessage = `短信通知设置成功！已向${totalRecipients}位参会人员`
    
    if (notifyForm.value.sendImmediately) {
      successMessage += '发送通知'
    }
    
    if (notifyForm.value.enableReminder) {
      const unit = notifyForm.value.reminderUnit === 'hours' ? '小时' : '天'
      if (notifyForm.value.sendImmediately) {
        successMessage += `，并设置会议前${notifyForm.value.reminderValue}${unit}提醒`
      } else {
        successMessage += `设置会议前${notifyForm.value.reminderValue}${unit}提醒`
      }
    }
    
    message.success(successMessage)
    notifyModalVisible.value = false
  } catch (error) {
    message.error('通知设置失败，请稍后重试')
  } finally {
    sendingNotification.value = false
  }
}

// 取消通知
const handleNotifyCancel = () => {
  notifyModalVisible.value = false
}

// 弹窗处理方法
const handleScheduleSubmit = () => {
  // 表单验证
  if (!scheduleForm.value.datetime) {
    message.error('请选择会议时间')
    return
  }
  if (!scheduleForm.value.location) {
    message.error('请输入会议地点')
    return
  }
  if (!scheduleForm.value.hosts || scheduleForm.value.hosts.length === 0) {
    message.error('请选择或输入会议主持人')
    return
  }
  if (!scheduleForm.value.experts || scheduleForm.value.experts.length === 0) {
    message.error('请选择或输入参会专家')
    return
  }

  message.success('会议安排完成')
  scheduleModalVisible.value = false
  
  // 将项目从待安排列表移动到已安排列表
  if (selectedProject.value) {
    const newMeeting = {
      ...selectedProject.value,
      meetingTime: scheduleForm.value.datetime ? dayjs(scheduleForm.value.datetime).format('YYYY-MM-DD HH:mm') : '',
      meetingLocation: scheduleForm.value.location,
      meetingType: scheduleForm.value.type,
      meetingHosts: scheduleForm.value.hosts, // 存储主持人数组
      meetingHost: scheduleForm.value.hosts.join('、'), // 显示用字符串
      meetingStatus: 'scheduled',
      experts: scheduleForm.value.experts, // 直接存储专家数组
      meetingMaterials: scheduleForm.value.materials, // 存储会议资料
      meetingDescription: scheduleForm.value.description
    }
    
    scheduledMeetingList.value.push(newMeeting)
    
    const index = pendingScheduleList.value.findIndex(p => p.id === selectedProject.value.id)
    if (index > -1) {
      pendingScheduleList.value.splice(index, 1)
    }
  }
}

const handleScheduleCancel = () => {
  scheduleModalVisible.value = false
}

const handleConclusionSubmit = () => {
  // 表单验证
  if (!conclusionForm.value.conclusion) {
    message.error('请选择验收结论')
    return
  }
  if (!conclusionForm.value.description) {
    message.error('请填写结论说明')
    return
  }
  if (conclusionForm.value.conclusion !== 'passed' && !conclusionForm.value.requirements) {
    message.error('请填写整改要求')
    return
  }

  message.success('验收结论录入完成')
  conclusionModalVisible.value = false
  
  // 处理结论录入或编辑
  if (selectedMeeting.value) {
    // 检查是否是编辑现有结论
    const existingConclusionIndex = conclusionList.value.findIndex(c => c.id === selectedMeeting.value.id)
    
    const conclusionData = {
      ...selectedMeeting.value,
      conclusionTime: existingConclusionIndex > -1 ? selectedMeeting.value.conclusionTime : dayjs().format('YYYY-MM-DD HH:mm:ss'),
      conclusion: conclusionForm.value.conclusion,
      score: conclusionForm.value.score,
      conclusionDescription: conclusionForm.value.description,
      requirements: conclusionForm.value.requirements,
      conclusionFiles: conclusionForm.value.conclusionFiles
    }
    
    if (existingConclusionIndex > -1) {
      // 编辑现有结论
      conclusionList.value[existingConclusionIndex] = conclusionData
      message.success('结论修改成功')
    } else {
      // 新增结论
      conclusionList.value.push(conclusionData)
    
    // 更新会议状态
    selectedMeeting.value.meetingStatus = 'completed'
      
      // 从已安排会议列表中移除该会议
      const meetingIndex = scheduledMeetingList.value.findIndex(m => m.id === selectedMeeting.value.id)
      if (meetingIndex > -1) {
        scheduledMeetingList.value.splice(meetingIndex, 1)
      }
    }
  }
}

const handleEditSubmit = () => {
  // 表单验证
  if (!editForm.value.datetime) {
    message.error('请选择会议时间')
    return
  }
  if (!editForm.value.location) {
    message.error('请输入会议地点')
    return
  }
  if (!editForm.value.hosts || editForm.value.hosts.length === 0) {
    message.error('请选择或输入会议主持人')
    return
  }
  if (!editForm.value.experts || editForm.value.experts.length === 0) {
    message.error('请选择或输入参会专家')
    return
  }

  // 更新会议信息
  if (selectedEditMeeting.value) {
    selectedEditMeeting.value.meetingTime = editForm.value.datetime ? dayjs(editForm.value.datetime).format('YYYY-MM-DD HH:mm') : ''
    selectedEditMeeting.value.meetingLocation = editForm.value.location
    selectedEditMeeting.value.meetingType = editForm.value.type
    selectedEditMeeting.value.meetingHosts = editForm.value.hosts
    selectedEditMeeting.value.meetingHost = editForm.value.hosts.join('、')
    selectedEditMeeting.value.experts = editForm.value.experts
    selectedEditMeeting.value.meetingMaterials = editForm.value.materials
    selectedEditMeeting.value.meetingDescription = editForm.value.description
  }

  message.success('会议信息更新成功')
  editModalVisible.value = false
}

const handleEditCancel = () => {
  editModalVisible.value = false
}

const handleConclusionCancel = () => {
  conclusionModalVisible.value = false
}

const handleDetailCancel = () => {
  detailModalVisible.value = false
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
/* 移除冗余样式，保留组件特有样式 */

.conclusion-container {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 0;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.meeting-stats {
  margin-bottom: 18px;
}
</style> 