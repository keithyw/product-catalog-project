import logging
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .services import AIGeneratorService, AIGenerationError
from .tool_definitions import AI_TOOLS_REGISTRY

logger = logging.getLogger(__name__)

class AIGenerateRequestSerializer(serializers.Serializer):
    prompt = serializers.CharField(max_length=5000)
    entity_type = serializers.ChoiceField(
        choices=list(AI_TOOLS_REGISTRY.keys()),        
    )

class AIGenerateContentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = AIGenerateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        prompt = serializer.validated_data['prompt']
        entity_type = serializer.validated_data['entity_type']

        try:
            svc = AIGeneratorService()
            content = svc.generate(prompt, entity_type)
            return Response({
                "status": "success",
                "entity_type": content['entity_type'],
                "data": content['data'],
            }, status=status.HTTP_200_OK)

        except AIGenerationError as e:
            logger.warning(f"AI failed for entitiy_type={entity_type}, prompt={prompt[:50]}... {e.message} Details: {e.details}")
            return Response({
                "status": "error",
                "message": e.message,
                "details": e.details,
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logging.exception(f"An unhandled exception occurred")
            return Response({
                "status": "error",
                "message": "An unexpected server error occurred",
                "details": str(e),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)